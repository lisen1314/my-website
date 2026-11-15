const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const [identityPath,hairPath,scenePath]=process.argv.slice(2);
if(!identityPath||!hairPath||!scenePath){console.error('Usage: node compare-models-local.cjs <identity-image> <hair-reference> <scene-reference>');process.exit(2)}
const inputs=[identityPath,hairPath,scenePath];
const mimeFor=file=>({'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file).toLowerCase()];
const images=inputs.map((file,index)=>{
  const buffer=fs.readFileSync(file),mime=mimeFor(file);
  if(!mime)throw new Error(`Unsupported image format: ${file}`);
  if(buffer.length>10*1024*1024)throw new Error(`Image ${index+1} exceeds 10 MB: ${file}`);
  return`data:${mime};base64,${buffer.toString('base64')}`;
});
const prompt='以参考图1中的顾客为唯一身份来源，严格保留脸型、五官、年龄、肤色和身形。参考图2只用于新发型参考，不要复制参考图2的人脸。参考图3只用于发型师、门店环境和站位参考。生成一张自然真实的美发沙龙前后对比作品：左侧保留参考图1的顾客原貌，右侧是同一位顾客换上参考图2发型后的效果，发型师站在身后整理发型。竖版 9:16，商业摄影质感，发丝和皮肤真实，不加文字、Logo 或水印。';

async function main(){
  const response=await fetch('http://127.0.0.1:5173/api/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,ratio:'9:16',images})});
  const payload=await response.json();
  if(!response.ok)throw new Error(payload.error||`Local API returned HTTP ${response.status}`);
  const outputDir=path.join(root,'model-comparison-results');
  for(const result of payload.results||[]){
    if(!result.url){console.log(`${result.id}: FAILED - ${result.error}`);continue}
    let data,mime='image/png';
    if(result.url.startsWith('data:')){const match=result.url.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);if(!match)throw new Error(`${result.id}: invalid data URL`);mime=match[1];data=Buffer.from(match[2],'base64')}
    else {const imageResponse=await fetch(result.url);if(!imageResponse.ok)throw new Error(`${result.id}: result download failed with HTTP ${imageResponse.status}`);mime=imageResponse.headers.get('content-type')?.split(';')[0]||mime;data=Buffer.from(await imageResponse.arrayBuffer())}
    fs.mkdirSync(outputDir,{recursive:true});
    const extension=mime==='image/jpeg'?'jpg':mime==='image/webp'?'webp':'png';
    const destination=path.join(outputDir,`${result.id}.${extension}`);
    fs.writeFileSync(destination,data);
    console.log(`${result.id}: SAVED ${destination}`);
  }
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
