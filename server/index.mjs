import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createStore,schedule,validateLibrary} from './store.mjs';
import {createLookupService,extractContext,LookupError} from './lookup.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const send=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};

export function startServer({dataDir=resolve(root,'data'),envFile=resolve(root,'.env'),distDir=resolve(root,'dist'),port=4318}={}){
try{process.loadEnvFile(envFile)}catch(e){if(e?.code!=='ENOENT')console.warn('Không đọc được file .env:',e.message)}
const store=createStore(resolve(dataDir,'leaf.sqlite'));
const lookup=createLookupService({db:store.db});
const sessionToken=randomUUID();
let hostRe=/^$/,originRe=/^$/;
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname.startsWith('/api/')){
      if(!hostRe.test(req.headers.host||'')) return send(res,403,{error:'Host không được phép.'});
      if(req.headers.origin && !originRe.test(req.headers.origin)) return send(res,403,{error:'Origin không được phép.'});
      let body={};
      if(!['GET','HEAD'].includes(req.method)){
        if(!req.headers['content-type']?.startsWith('application/json')) return send(res,415,{error:'Cần dữ liệu JSON.'});
        const maxBody=url.pathname==='/api/lookup'?4096:12_000_000;
        let raw=''; for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>maxBody) return send(res,413,{error:maxBody===4096?'Yêu cầu tra từ quá lớn.':'Dữ liệu vượt quá 12 MB.'});}
        try{body=JSON.parse(raw);}catch{return send(res,400,{error:'JSON không hợp lệ.'});}
      }
      const route=url.pathname.slice(4);
      if(route==='/library'&&req.method==='GET')return send(res,200,store.read());
      if(route==='/session'&&req.method==='GET')return send(res,200,{token:sessionToken,lookup:lookup.status()});
      if(route==='/lookup'&&req.method==='POST'){
        if(req.headers['x-leaf-token']!==sessionToken)return send(res,403,{error:'Phiên làm việc đã thay đổi. Tải lại trang.',code:'bad_token'});
        const passage=store.read().passages.find(p=>p.id===body?.passageId);
        if(!passage)return send(res,404,{error:'Không tìm thấy bài đọc.'});
        try{return send(res,200,await lookup.lookup(extractContext(passage.content,body.start,body.end)));}
        catch(e){if(e instanceof LookupError)return send(res,e.status,{error:e.message});throw e;}
      }
      if(route==='/import'&&req.method==='POST'){validateLibrary(body);return send(res,200,store.write(body));}
      if(route==='/passages'&&req.method==='POST')return send(res,201,store.mutate(d=>d.passages.unshift({...body,id:randomUUID(),createdAt:new Date().toISOString(),status:'unread'})));
      const match=route.match(/^\/(passages|annotations)\/([^/]+)(\/review)?$/);
      if(match){
        const [,collection,id,review]=match;
        const data=store.read(); const item=data[collection].find(i=>i.id===id);
        if(!item)return send(res,404,{error:'Không tìm thấy dữ liệu.'});
        if(review&&req.method==='POST'&&collection==='annotations'){schedule(item,body.rating);return send(res,200,store.write(data));}
        if(!review&&req.method==='DELETE'){
          data[collection]=data[collection].filter(i=>i.id!==id);
          if(collection==='passages')data.annotations=data.annotations.filter(a=>a.passageId!==id);
          return send(res,200,store.write(data));
        }
        if(!review&&req.method==='PATCH'){
          if(collection==='passages' && body.content!==undefined && body.content!==item.content && data.annotations.some(a=>a.passageId===id))throw Error('Bài đã có highlight. Hãy xóa các highlight trước khi sửa nội dung để giữ đúng vị trí.');
          const allowed=collection==='passages'?['title','content','source','tags','status']:['kind','meaning','note'];
          for(const key of allowed)if(Object.hasOwn(body,key))item[key]=body[key];
          return send(res,200,store.write(data));
        }
      }
      if(route==='/annotations'&&req.method==='POST')return send(res,201,store.mutate(d=>d.annotations.push({...body,id:randomUUID(),due:new Date().toISOString(),interval:0,reviews:0})));
      return send(res,404,{error:'Đường dẫn không tồn tại.'});
    }
    const dist=distDir;let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
    if(file!==dist&&!file.startsWith(dist+sep))return send(res,403,{error:'Forbidden'});
    if(!extname(file))file=resolve(dist,'index.html');
    try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream'});res.end(bytes);}catch{send(res,404,{error:'Chạy npm run build trước khi mở bản production.'});}
  }catch(error){send(res,400,{error:error.message||'Không thể xử lý yêu cầu.'});}
});
return new Promise((ok,fail)=>{
  server.once('error',e=>{store.close();fail(e)});
  server.listen(port,'127.0.0.1',()=>{
    const actual=server.address().port;
    hostRe=new RegExp(`^(127\\.0\\.0\\.1|localhost):(${actual}|5173)$`);
    originRe=new RegExp(`^http://(127\\.0\\.0\\.1|localhost):(${actual}|5173)$`);
    server.on('close',()=>store.close());
    const url=`http://127.0.0.1:${actual}`;
    ok({server,port:actual,url,close:()=>new Promise(done=>{server.close(()=>done());server.closeAllConnections();})});
  });
});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  startServer().then(s=>console.log('Leaf API / production: '+s.url)).catch(e=>{console.error('Không khởi động được Leaf:',e.message);process.exit(1)});
}
