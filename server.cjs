const http=require('http');
const fs=require('fs');
const path=require('path');
const os=require('os');
const root=__dirname;
for(const line of (fs.existsSync(path.join(root,'.env.local'))?fs.readFileSync(path.join(root,'.env.local'),'utf8'):'').split(/\r?\n/)){
  const match=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if(match&&!process.env[match[1]])process.env[match[1]]=match[2].replace(/^(["'])(.*)\1$/,'$2');
}
const models={
  seedream:{vendor:'火山引擎',name:'Seedream 5.5',model:'doubao-seedream-5-5-261028',key:'ARK_API_KEY'},
  qwen:{vendor:'阿里云百炼',name:'Qwen Image Edit',model:'qwen-image-2.0-pro',key:'DASHSCOPE_API_KEY'},
  gemini:{vendor:'Google Gemini',name:'Nano Banana 2.1',model:'gemini-nano-banana-2.1',key:'GEMINI_API_KEY'}
};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function isLoopback(address=''){return address==='127.0.0.1'||address==='::1'||address==='::ffff:127.0.0.1'}
function readBody(req){return new Promise((resolve,reject)=>{const chunks=[];let size=0;req.on('data',chunk=>{size+=chunk.length;if(size>75*1024*1024){reject(new Error('请求图片总大小不能超过 75 MB'));req.destroy();return}chunks.push(chunk)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(new Error('请求内容不是有效 JSON'))}});req.on('error',reject)})}
function imageParts(images){return images.map((image,index)=>{if(typeof image!=='string'||image.length>15*1024*1024||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))throw new Error(`第 ${index+1} 张图片格式或大小不符合要求`);const match=image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);return{data:image,mimeType:match[1],base64:match[2]}})}
async function providerRequest(url,key,body,headers={}){
  const requestHeaders={'Content-Type':'application/json',...headers};if(key)requestHeaders.Authorization=`Bearer ${key}`;
  const response=await fetch(url,{method:'POST',headers:requestHeaders,body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
  const text=await response.text();let data;try{data=JSON.parse(text)}catch{data={}}
  if(!response.ok){let message=data.error?.message||data.message||`上游服务返回 HTTP ${response.status}`;if(key)message=String(message).replaceAll(key,'[已隐藏]');throw new Error(String(message).slice(0,450))}
  return data;
}
async function generateSeedream(prompt,images){
  const key=process.env.ARK_API_KEY;if(!key)throw new Error('未配置 ARK_API_KEY');
  const data=await providerRequest('https://ark.cn-beijing.volces.com/api/v3/images/generations',key,{model:models.seedream.model,prompt,image:images.map(item=>item.data),size:'2K',output_format:'jpeg',response_format:'url',watermark:false});
  const output=data.data?.[0];if(output?.url)return{id:'seedream',url:output.url};if(output?.b64_json)return{id:'seedream',url:`data:image/jpeg;base64,${output.b64_json}`};throw new Error('Seedream 未返回图片地址');
}
async function generateQwen(prompt,images,ratio){
  const key=process.env.DASHSCOPE_API_KEY;if(!key)throw new Error('未配置 DASHSCOPE_API_KEY');
  const sizes={'9:16':'720*1280','3:4':'960*1280','1:1':'1024*1024','16:9':'1280*720'};
  const content=[...images.map(item=>({image:item.data})),{text:prompt}];
  const data=await providerRequest(process.env.DASHSCOPE_ENDPOINT||'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',key,{model:models.qwen.model,input:{messages:[{role:'user',content}]},parameters:{n:1,size:sizes[ratio]||sizes['9:16'],prompt_extend:false,watermark:false}});
  const output=data.output?.choices?.[0]?.message?.content?.find(item=>item.image)?.image||data.output?.results?.[0]?.url;
  if(output)return{id:'qwen',url:output};throw new Error(data.message||data.code||'Qwen 未返回图片地址');
}
async function generateGemini(prompt,images){
  const key=process.env.GEMINI_API_KEY;if(!key)throw new Error('未配置 GEMINI_API_KEY');
  const input=[{type:'text',text:prompt},...images.map(item=>({type:'image',mime_type:item.mimeType,data:item.base64}))];
  const data=await providerRequest('https://generativelanguage.googleapis.com/v1beta/interactions',null,{model:models.gemini.model,input},{'Api-Revision':'2026-05-20','x-goog-api-key':key});
  const output=data.output_image||data.outputs?.find(item=>item.type==='image')||data.output?.find?.(item=>item.type==='image');
  if(output?.url)return{id:'gemini',url:output.url};if(output?.data)return{id:'gemini',url:`data:${output.mime_type||'image/png'};base64,${output.data}`};throw new Error('Gemini 未返回图片');
}
const server=http.createServer(async(req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
  if(pathname.startsWith('/api/')){
    if(!isLoopback(req.socket.remoteAddress)){json(res,403,{error:'模型对比接口仅允许本机访问'});return}
    if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){json(res,403,{error:'跨站请求已拒绝'});return}}catch{json(res,403,{error:'无效的请求来源'});return}}
    if(pathname==='/api/models'&&req.method==='GET'){json(res,200,{models:Object.fromEntries(Object.entries(models).map(([id,model])=>[id,{vendor:model.vendor,name:model.name,model:model.model,configured:Boolean(process.env[model.key])}]))});return}
    if(pathname==='/api/compare'&&req.method==='POST'){
      try{
        const body=await readBody(req);if(typeof body.prompt!=='string'||!body.prompt.trim())throw new Error('请填写共同提示词');
        if(!Array.isArray(body.images)||body.images.length!==3)throw new Error('需要上传 3 张参考图');
        const images=imageParts(body.images),prompt=`${body.prompt.trim()}\n输出比例：${body.ratio||'9:16'}。只生成 1 张图片。`;
        const jobs=[['seedream',()=>generateSeedream(prompt,images)],['qwen',()=>generateQwen(prompt,images,body.ratio)],['gemini',()=>generateGemini(prompt,images)]];
        const results=await Promise.all(jobs.map(async([id,run])=>{try{return await run()}catch(error){return{id,error:error.message||'生成失败'}}}));
        json(res,200,{results});
      }catch(error){json(res,400,{error:error.message||'请求失败'})}
      return;
    }
    json(res,404,{error:'API 路径不存在'});return;
  }
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)});
}).listen(5173,'0.0.0.0',()=>{
  console.log('灵感ai本机预览 http://127.0.0.1:5173');
  for(const addresses of Object.values(os.networkInterfaces()))for(const address of addresses||[])if(address.family==='IPv4'&&!address.internal)console.log(`同一 Wi-Fi 访问 http://${address.address}:5173`);
});
