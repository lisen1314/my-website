const http=require('http');
const fs=require('fs');
const path=require('path');
const os=require('os');
const root=__dirname;
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)});
}).listen(5173,'0.0.0.0',()=>{
  console.log('灵感ai本机预览 http://127.0.0.1:5173');
  for(const addresses of Object.values(os.networkInterfaces()))for(const address of addresses||[])if(address.family==='IPv4'&&!address.internal)console.log(`同一 Wi-Fi 访问 http://${address.address}:5173`);
});
