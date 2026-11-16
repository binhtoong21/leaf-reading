import {useEffect,useState} from 'react';
import {ArrowClockwise,PencilSimple} from '@phosphor-icons/react';
import {Modal} from '../components/Modal';
import {lookup,type LookupTarget} from '../lib/api';
import {formatNote} from '../lib/lookup';
import {kinds,type Kind,type LookupEntry} from '../lib/types';
type Draft={kind:Kind;meaning:string;note:string};
export function LookupDialog({target,canSave,onClose,onSave,onManual}:{target:LookupTarget;canSave:boolean;onClose:()=>void;onSave:(draft:Draft)=>Promise<void>;onManual:()=>void}){
 const [entry,setEntry]=useState<LookupEntry|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[draft,setDraft]=useState<Draft|null>(null),[busy,setBusy]=useState(false),[saveError,setSaveError]=useState('');
 useEffect(()=>{let live=true;setEntry(null);setError('');lookup(target).then(r=>{if(live)setEntry(r.entry)}).catch(e=>{if(live)setError((e as Error).message)});return()=>{live=false}},[target,attempt]);
 const save=async()=>{if(!draft)return;setBusy(true);setSaveError('');try{await onSave({kind:draft.kind,meaning:draft.meaning.trim(),note:draft.note.trim()});onClose()}catch(e){setSaveError((e as Error).message)}finally{setBusy(false)}};
 return <Modal wide title={draft?'Lưu vào sổ kiến thức':'Tra từ'} onClose={onClose}><blockquote className={'quote '+(draft?.kind??entry?.kind??'vocabulary')}>{target.quote}</blockquote>
 {draft?<form onSubmit={e=>{e.preventDefault();void save()}}>
  <div className="kind-options">{Object.entries(kinds).map(([k,v])=><button type="button" key={k} className={draft.kind===k?'kind selected '+k:'kind'} onClick={()=>setDraft({...draft,kind:k as Kind})}>{v}</button>)}</div>
  <label>{draft.kind==='note'?'Ý chính / tiêu đề':'Nghĩa / cách hiểu'}<input required maxLength={10000} value={draft.meaning} onChange={e=>setDraft({...draft,meaning:e.target.value})} autoFocus/></label>
  <label>Giải thích & ví dụ thêm<textarea rows={10} maxLength={20000} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label>
  <p className="hint">Gợi ý do AI tạo. Hãy sửa lại bằng lời của bạn trước khi lưu.{draft.kind!=='note'?' Sẽ được thêm vào lịch ôn tập.':''}</p>
  {saveError&&<p role="alert" className="error">{saveError}</p>}
  <footer className="modal-actions"><button type="button" className="secondary" onClick={()=>setDraft(null)}>Quay lại</button><button disabled={busy}>{busy?'Đang lưu…':'Lưu ghi chú'}</button></footer></form>
 :error?<><p role="alert" className="error">{error}</p><footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Đóng</button>{canSave&&<button type="button" className="secondary" onClick={onManual}><PencilSimple/>Ghi chú thủ công</button>}<button type="button" onClick={()=>setAttempt(a=>a+1)}><ArrowClockwise/>Thử lại</button></footer></>
 :!entry?<div className="lookup-loading" role="status" aria-live="polite"><span className="lookup-spinner" aria-hidden="true"/>Đang tra nghĩa trong ngữ cảnh…</div>
 :<><div className="lookup-entry">
  <div className="lookup-head"><strong>{entry.headword}</strong>{entry.ipa&&<span className="lookup-ipa">{entry.ipa}</span>}{entry.pos&&<span className="lookup-pos">{entry.pos}</span>}</div>
  <p className="lookup-meaning">{entry.meaningVi}</p>
  <section><h4>Trong bài này</h4><p>{entry.senseInContext}</p>{entry.insufficientContext&&<p className="hint">Ngữ cảnh ngắn, nghĩa có thể chưa chính xác.</p>}</section>
  {entry.collocations.length>0&&<section><h4>Cách dùng thường gặp</h4><ul>{entry.collocations.map((c,i)=><li key={i}><strong>{c.en}</strong>: {c.vi}</li>)}</ul></section>}
  {(entry.wordFamily??[]).length>0&&<section><h4>Họ từ</h4><ul>{(entry.wordFamily??[]).map((f,i)=><li key={i}><strong>{f.word}</strong>{f.pos&&` (${f.pos})`}: {f.vi}</li>)}</ul></section>}
  {entry.examples.length>0&&<section><h4>Ví dụ</h4>{entry.examples.map((x,i)=><p key={i} className="lookup-example">{x.en}<br/><span>→ {x.vi}</span></p>)}</section>}
  {entry.contrasts.length>0&&<section><h4>Phân biệt</h4><ul>{entry.contrasts.map((c,i)=><li key={i}><strong>{c.word}</strong>: {c.explanation}</li>)}</ul></section>}
  {entry.tip&&<section><h4>Mẹo ghi nhớ</h4><p>{entry.tip}</p></section>}
  <p className="hint">Nội dung do AI tạo, có thể sai. Chỉ phần bạn chọn và câu chứa nó được gửi tới nhà cung cấp AI.</p></div>
  <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Đóng</button>{canSave?<button type="button" onClick={()=>setDraft({kind:entry.kind,meaning:entry.meaningVi,note:formatNote(entry)})}><PencilSimple/>Lưu ghi chú…</button>:<span className="hint">Vùng chọn trùng highlight đã có nên chỉ xem được.</span>}</footer></>}
 </Modal>;
}
