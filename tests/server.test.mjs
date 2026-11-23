import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startServer} from '../server/index.mjs';

test('startServer keeps data in dataDir and guards the API by its own port',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'leaf-srv-'));
 const api=await startServer({dataDir:dir,envFile:join(dir,'.env'),port:0});
 try{
  assert.notEqual(api.port,4318);
  const res=await fetch(api.url+'/api/library');
  assert.equal(res.status,200);
  assert.ok(Array.isArray((await res.json()).passages));
  assert.ok(existsSync(join(dir,'leaf.sqlite')));
  const foreign=await fetch(api.url+'/api/library',{headers:{Origin:'http://evil.example'}});
  assert.equal(foreign.status,403);
 }finally{await api.close();rmSync(dir,{recursive:true,force:true})}
});

test('DELETE without a body removes a passage and its annotations',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'leaf-srv-'));
 const api=await startServer({dataDir:dir,envFile:join(dir,'.env'),port:0});
 const call=(path,method,body)=>fetch(api.url+'/api'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 try{
  const lib=await (await call('/passages','POST',{title:'T',content:'hello world',source:'',tags:[]})).json();
  const passageId=lib.passages.find(p=>p.title==='T').id;
  const withNote=await (await call('/annotations','POST',{passageId,start:0,end:5,quote:'hello',kind:'vocabulary',meaning:'xin chào',note:''})).json();
  const del=await call('/annotations/'+withNote.annotations.find(a=>a.passageId===passageId).id,'DELETE');
  assert.equal(del.status,200);
  assert.ok(!(await del.json()).annotations.some(a=>a.passageId===passageId));
  const delPassage=await call('/passages/'+passageId,'DELETE');
  assert.equal(delPassage.status,200);
  assert.ok(!(await delPassage.json()).passages.some(p=>p.id===passageId));
 }finally{await api.close();rmSync(dir,{recursive:true,force:true})}
});
