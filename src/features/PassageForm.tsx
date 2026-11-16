import {useState} from 'react';
import type {Passage} from '../lib/types';
import {Modal} from '../components/Modal';
export function PassageForm({passage,locked,onClose,onSave}:{passage?:Passage;locked:boolean;onClose:()=>void;onSave:(data:unknown)=>Promise<void>}){
 const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 return <Modal title={passage?'Chỉnh sửa bài đọc':'Một bài đọc mới'} onClose={onClose} wide><p className="muted">Mang bài đọc từ sách, website hoặc tài liệu của bạn vào đây.</p><form onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');try{await onSave({title:String(f.get('title')).trim(),source:String(f.get('source')).trim(),tags:String(f.get('tags')).split(',').map(t=>t.trim()).filter(Boolean),content:locked?passage!.content:String(f.get('content')).replace(/\r\n/g,'\n').trim()});onClose()}catch(err){setError((err as Error).message)}finally{setBusy(false)}}}>
 <label>Tiêu đề<input name="title" required maxLength={300} defaultValue={passage?.title} placeholder="Bài đọc hôm nay nói về điều gì?" autoFocus/></label>
 <div className="form-grid"><label>Nguồn / đường dẫn<input name="source" maxLength={2000} defaultValue={passage?.source} placeholder="Tên sách, trang, hoặc URL"/></label><label>Thẻ chủ đề <small>ngăn cách bằng dấu phẩy</small><input name="tags" defaultValue={passage?.tags.join(', ')} placeholder="TOEIC, Business, Part 7"/></label></div>
 <label>Nội dung bài đọc<textarea name="content" required rows={12} maxLength={500000} defaultValue={passage?.content} readOnly={locked} placeholder="Dán nội dung tiếng Anh vào đây…"/></label>{locked&&<p className="hint">Nội dung đang khóa vì đã có highlight. Gỡ highlight trước khi sửa nội dung.</p>}
 {error&&<p role="alert" className="error">{error}</p>}<footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Hủy</button><button disabled={busy}>{busy?'Đang lưu…':'Lưu bài đọc'}</button></footer></form></Modal>;
}
