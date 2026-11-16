import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createStore,schedule,validateLibrary} from './store.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const store=createStore(resolve(root,'data/leaf.sqlite'));
const send=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname.startsWith('/api/')){
      if(req.headers.origin && !/^http:\/\/(127\.0\.0\.1|localhost):(4318|5173)$/.test(req.headers.origin)) return send(res,403,{error:'Origin không được phép.'});
      let body={};
      if(!['GET','HEAD'].includes(req.method)){
        if(!req.headers['content-type']?.startsWith('application/json')) return send(res,415,{error:'Cần dữ liệu JSON.'});
        let raw=''; for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12_000_000) return send(res,413,{error:'Dữ liệu vượt quá 12 MB.'});}
        try{body=JSON.parse(raw);}catch{return send(res,400,{error:'JSON không hợp lệ.'});}
      }
      const route=url.pathname.slice(4);
      if(route==='/library'&&req.method==='GET')return send(res,200,store.read());
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
    const dist=resolve(root,'dist');let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
    if(file!==dist&&!file.startsWith(dist+sep))return send(res,403,{error:'Forbidden'});
    if(!extname(file))file=resolve(dist,'index.html');
    try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream'});res.end(bytes);}catch{send(res,404,{error:'Chạy npm run build trước khi mở bản production.'});}
  }catch(error){send(res,400,{error:error.message||'Không thể xử lý yêu cầu.'});}
});
server.listen(4318,'127.0.0.1',()=>console.log('Leaf API / production: http://127.0.0.1:4318'));
