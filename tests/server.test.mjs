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
