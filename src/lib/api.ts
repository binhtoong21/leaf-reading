import type {Library,LookupEntry} from './types';
export async function request<T>(path:string, method='GET', body?:unknown, headers:Record<string,string>={}):Promise<T> {
  const response = await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});
  const result = await response.json().catch(()=>({}));
  if(!response.ok) throw Object.assign(new Error(result.error || 'Không thể lưu dữ liệu.'),{code:result.code as string|undefined,status:response.status});
  return result;
}
export const loadLibrary = () => request<Library>('/library');
type Session = {token:string; lookup:{configured:boolean; dailyLimit:number; usedToday:number}};
let session:Promise<Session>|null = null;
export function getSession(fresh=false):Promise<Session> {
  if(fresh||!session){const pending=request<Session>('/session');session=pending;pending.catch(()=>{if(session===pending)session=null});}
  return session;
}
export type LookupTarget = {passageId:string; start:number; end:number; quote:string};
export async function lookup(target:LookupTarget):Promise<{entry:LookupEntry;cached:boolean}> {
  const body={passageId:target.passageId,start:target.start,end:target.end};
  const send=async(fresh:boolean)=>request<{entry:LookupEntry;cached:boolean}>('/lookup','POST',body,{'X-Leaf-Token':(await getSession(fresh)).token});
  try{return await send(false)}catch(e){if((e as {code?:string}).code==='bad_token')return send(true);throw e}
}
