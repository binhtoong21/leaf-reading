export type Kind = 'vocabulary' | 'phrase' | 'grammar' | 'note';
export type Passage = {id:string; title:string; content:string; source:string; tags:string[]; status:'unread'|'reading'|'done'; createdAt:string};
export type Annotation = {id:string; passageId:string; start:number; end:number; quote:string; kind:Kind; meaning:string; note:string; due:string; interval:number; reviews:number};
export type Library = {version:1; passages:Passage[]; annotations:Annotation[]};
export const kinds: Record<Kind,string> = {vocabulary:'Từ vựng',phrase:'Cụm từ',grammar:'Ngữ pháp',note:'Ghi chú'};
export const statuses = {unread:'Chưa đọc',reading:'Đang đọc',done:'Đã đọc'};
export type LookupEntry = {headword:string; ipa:string; pos:string; kind:Exclude<Kind,'note'>; meaningVi:string; senseInContext:string; collocations:{en:string;vi:string}[]; examples:{en:string;vi:string}[]; contrasts:{word:string;explanation:string}[]; tip:string; insufficientContext:boolean};

