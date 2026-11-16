import {useState} from 'react';
import {PencilSimple} from '@phosphor-icons/react';
import {Modal} from '../components/Modal';
import {NoteText} from '../components/NoteText';
import {kinds,type Annotation,type Kind} from '../lib/types';
const noteRows=(note='')=>Math.min(18,Math.max(4,note.split('\n').reduce((n,l)=>n+Math.max(1,Math.ceil(l.length/75)),0)+1));
export function AnnotationForm({initial,onClose,onSave,onDelete}:{initial:Partial<Annotation>&{quote:string};onClose:()=>void;onSave:(data:unknown)=>Promise<void>;onDelete?:()=>Promise<void>}){
 const [kind,setKind]=useState<Kind>(initial.kind||'vocabulary'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [editing,setEditing]=useState(!initial.id);
 const wide=(initial.note?.length??0)>300;
 const act=async(fn:()=>Promise<void>)=>{setBusy(true);try{await fn();onClose()}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 if(!editing)return <Modal wide={wide} title="Ghi chú của bạn" onClose={onClose}><blockquote className={'quote '+kind}>{initial.quote}</blockquote><div className="note-view"><span className={'tag '+kind}>{kinds[kind]}</span><h3>{initial.meaning}</h3>{initial.note&&<NoteText text={initial.note}/>}</div>
 {error&&<p role="alert" className="error">{error}</p>}<footer className="modal-actions">{onDelete&&<button type="button" className="danger ghost" disabled={busy} onClick={()=>void act(onDelete)}>Xóa highlight</button>}<button type="button" className="secondary" onClick={onClose}>Đóng</button><button type="button" autoFocus onClick={()=>setEditing(true)}><PencilSimple/>Sửa ghi chú</button></footer></Modal>;
 return <Modal wide={wide} title={initial.id?'Ghi chú của bạn':'Giữ lại điều vừa học'} onClose={onClose}><blockquote className={'quote '+kind}>{initial.quote}</blockquote><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void act(()=>onSave({kind,meaning:String(f.get('meaning')).trim(),note:String(f.get('note')).trim()}))}}>
 <div className="kind-options">{Object.entries(kinds).map(([k,v])=><button type="button" key={k} className={kind===k?'kind selected '+k:'kind'} onClick={()=>setKind(k as Kind)}>{v}</button>)}</div>
 <label>{kind==='note'?'Ý chính / tiêu đề':'Nghĩa / cách hiểu'}<input name="meaning" required maxLength={10000} defaultValue={initial.meaning} autoFocus placeholder="Viết bằng lời của bạn…"/></label><label>Giải thích & ví dụ thêm<textarea name="note" className="note-input" rows={noteRows(initial.note)} maxLength={20000} defaultValue={initial.note} placeholder="Cách dùng, cấu trúc hoặc một câu ví dụ của riêng bạn"/></label>
 {kind!=='note'&&<p className="hint">Sẽ được thêm vào lịch ôn tập. Ngữ cảnh luôn đi cùng kiến thức.</p>}{error&&<p role="alert" className="error">{error}</p>}<footer className="modal-actions">{onDelete&&<button type="button" className="danger ghost" disabled={busy} onClick={()=>void act(onDelete)}>Xóa highlight</button>}<button type="button" className="secondary" onClick={initial.id?()=>{setError('');setEditing(false)}:onClose}>Hủy</button><button disabled={busy}>{busy?'Đang lưu…':'Lưu ghi chú'}</button></footer></form></Modal>;
}
