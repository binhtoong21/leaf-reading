import type {LookupEntry} from './types';
export function formatNote(e:LookupEntry):string {
  const head=[e.headword,e.ipa].filter(Boolean).join(' ');
  const lines=[e.pos?`${head} · ${e.pos}`:head,`Trong bài: ${e.senseInContext}`];
  if(e.collocations.length)lines.push('','Cách dùng thường gặp:',...e.collocations.map(c=>`- ${c.en}: ${c.vi}`));
  if(e.examples.length)lines.push('','Ví dụ:',...e.examples.flatMap(x=>[x.en,`→ ${x.vi}`]));
  if(e.contrasts.length)lines.push('','Phân biệt:',...e.contrasts.map(c=>`- ${c.word}: ${c.explanation}`));
  if(e.tip)lines.push('',`Mẹo ghi nhớ: ${e.tip}`);
  return lines.join('\n');
}
