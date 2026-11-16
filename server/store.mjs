import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const fail = message => { throw new Error(message); };
const string = (v,max,required=false) => typeof v==='string' && v.length<=max && (!required||v.trim().length>0);
export function validateLibrary(data) {
  if(!data || data.version!==1 || !Array.isArray(data.passages)||!Array.isArray(data.annotations)||data.passages.length>10000||data.annotations.length>100000) fail('Bản sao lưu không đúng định dạng Leaf v1.');
  const ids=new Set();
  for(const p of data.passages){
    if(!p || !string(p.id,100,true)||ids.has(p.id)||!string(p.title,300,true)||!string(p.content,500000,true)||!string(p.source,2000)||!Array.isArray(p.tags)||p.tags.length>30||!p.tags.every(t=>string(t,80,true))||!['unread','reading','done'].includes(p.status)||!Number.isFinite(Date.parse(p.createdAt))) fail('Thông tin bài đọc không hợp lệ.');
    ids.add(p.id);
  }
  const annotationIds=new Set(); const ranges=new Map();
  for(const a of data.annotations){
    const p=data.passages.find(p=>p.id===a?.passageId);
    if(!a||!p||!string(a.id,100,true)||annotationIds.has(a.id)||!Number.isInteger(a.start)||!Number.isInteger(a.end)||a.start<0||a.end<=a.start||a.end>p.content.length||p.content.slice(a.start,a.end)!==a.quote||!['vocabulary','phrase','grammar','note'].includes(a.kind)||!string(a.meaning,10000)||!string(a.note,20000)||!Number.isFinite(Date.parse(a.due))||!Number.isInteger(a.interval)||a.interval<0||a.interval>365||!Number.isInteger(a.reviews)||a.reviews<0) fail('Ghi chú hoặc vị trí highlight không hợp lệ.');
    const previous=ranges.get(p.id)||[];
    if(previous.some(r=>a.start<r.end&&a.end>r.start)) fail('Các highlight không được chồng lên nhau.');
    previous.push(a); ranges.set(p.id,previous); annotationIds.add(a.id);
  }
  return data;
}
export function createStore(path) {
  if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS library (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL)');
  if(!db.prepare('SELECT id FROM library WHERE id=1').get()) db.prepare('INSERT INTO library VALUES (1, ?)').run(JSON.stringify(seed()));
  const read=()=>JSON.parse(db.prepare('SELECT data FROM library WHERE id=1').get().data);
  const write=data=>{validateLibrary(data);db.prepare('UPDATE library SET data=? WHERE id=1').run(JSON.stringify(data));return data;};
  return {read,write,close:()=>db.close(), mutate(fn){const data=read();fn(data);return write(data);}};
}
export function schedule(annotation,rating,now=new Date()) {
  if(!['again','hard','good','easy'].includes(rating)) fail('Mức độ ghi nhớ không hợp lệ.');
  const old=annotation.interval;
  const interval=rating==='again'?0:rating==='hard'?Math.max(1,Math.ceil(old*1.2)):rating==='good'?Math.max(1,Math.ceil(old*2.5)):Math.max(4,old*4);
  annotation.interval=Math.min(interval,365);
  annotation.due=new Date(now.getTime()+(rating==='again'?10*60*1000:annotation.interval*86400000)).toISOString();
  annotation.reviews++;
}
function seed(){
  const content=`A small change in the way we work\n\nFor years, the staff at Greenfield Library followed the same routine. Every morning, they sorted returned books, answered enquiries, and prepared the reading rooms for visitors. But as the number of visitors grew, the team found it increasingly difficult to keep up with demand.\n\nRather than hiring more staff, the library director decided to rethink the schedule. She set aside thirty minutes each week for the team to share ideas. At first, only a few people spoke. Over time, however, these informal conversations led to a number of practical improvements.\n\nOne suggestion was to place a self-service collection shelf near the entrance. Another was to send a reminder to readers before their books were due. Neither change required a significant investment, yet both made a noticeable difference.\n\nThe experience taught the team an important lesson: meaningful progress does not always depend on a large budget. Sometimes, it begins with making room for a conversation.`;
  const id=randomUUID(), now=new Date().toISOString();
  return {version:1,passages:[{id,title:'Small changes, meaningful progress',source:'Bài đọc mẫu của Leaf · Workplace & community',tags:['TOEIC','Workplace'],content,status:'reading',createdAt:now}],annotations:[['keep up with','phrase','theo kịp, đáp ứng kịp','keep up with demand = đáp ứng kịp nhu cầu'],['set aside','vocabulary','dành riêng (thời gian, tiền bạc)','set aside + khoảng thời gian + for something'],['Rather than hiring more staff','grammar','Thay vì tuyển thêm nhân viên','Rather than + V-ing: diễn tả lựa chọn thay thế.']].map(([quote,kind,meaning,note])=>({id:randomUUID(),passageId:id,start:content.indexOf(quote),end:content.indexOf(quote)+quote.length,quote,kind,meaning,note,due:now,interval:0,reviews:0}))};
}
