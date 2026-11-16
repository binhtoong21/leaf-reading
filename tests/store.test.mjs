import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStore,validateLibrary,schedule} from '../server/store.mjs';

test('SQLite persists passages and annotations across reopening',()=>{
 const dir=mkdtempSync(join(tmpdir(),'leaf-test-'));const path=join(dir,'test.sqlite');
 try{let store=createStore(path);const data=store.read();assert.equal(data.passages.length,1);assert.equal(data.annotations.length,3);data.passages[0].title='My saved reading';store.write(data);store.close();store=createStore(path);assert.equal(store.read().passages[0].title,'My saved reading');store.close();}finally{rmSync(dir,{recursive:true,force:true})}
});
test('invalid import cannot replace valid stored data',()=>{
 const store=createStore(':memory:');try{const original=store.read();const broken=structuredClone(original);broken.annotations[0].start++;assert.throws(()=>store.write(broken),/không hợp lệ/);assert.deepEqual(store.read(),original)}finally{store.close()}
});
test('orphan and overlapping highlights are rejected',()=>{
 const store=createStore(':memory:');try{const original=store.read();const overlap=structuredClone(original);overlap.annotations.push({...overlap.annotations[0],id:'another-id'});assert.throws(()=>validateLibrary(overlap),/chồng/);const orphan=structuredClone(original);orphan.passages=[];assert.throws(()=>validateLibrary(orphan),/không hợp lệ/)}finally{store.close()}
});
test('review intervals progress and again returns in ten minutes',()=>{
 const now=new Date('2026-11-16T00:00:00Z');const a={interval:0,reviews:0};schedule(a,'good',now);assert.equal(a.interval,1);assert.equal(a.due,'2026-11-17T00:00:00.000Z');schedule(a,'easy',now);assert.equal(a.interval,4);schedule(a,'again',now);assert.equal(a.interval,0);assert.equal(a.due,'2026-11-16T00:10:00.000Z');assert.equal(a.reviews,3);assert.throws(()=>schedule(a,'invalid',now));
});
test('empty library is a valid backup and Unicode offsets roundtrip',()=>{
 assert.doesNotThrow(()=>validateLibrary({version:1,passages:[],annotations:[]}));const store=createStore(':memory:');try{const d=store.read();d.passages[0].content='Tiếng Việt — reading';d.annotations=[{...d.annotations[0],quote:'Việt',start:6,end:10}];assert.deepEqual(store.write(d),d)}finally{store.close()}
});
