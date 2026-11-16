import type {Library} from './types';
export async function request<T>(path:string, method='GET', body?:unknown):Promise<T> {
  const response = await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const result = await response.json();
  if(!response.ok) throw new Error(result.error || 'Không thể lưu dữ liệu.');
  return result;
}
export const loadLibrary = () => request<Library>('/library');
