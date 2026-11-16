const heading=/^[^\s\-→].{0,40}:$/;
export function NoteText({text}:{text:string}){
 return <div className="note-text">{text.split('\n').map((raw,i)=>{const line=raw.trim();
  if(!line)return <div key={i} className="note-gap"/>;
  if(heading.test(line))return <h4 key={i}>{line.slice(0,-1)}</h4>;
  if(line.startsWith('- '))return <p key={i} className="note-item">{line.slice(2)}</p>;
  if(line.startsWith('→'))return <p key={i} className="note-translation">{line}</p>;
  return <p key={i}>{line}</p>;})}</div>;
}
