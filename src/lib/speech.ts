export const SPEECH_MAX=500;
export function pickEnglishVoice<V extends {lang:string;localService?:boolean}>(voices:readonly V[]):V|null{
 // Local voices only: browser "online" voices (Google, Edge Natural) send the text to a remote server.
 const english=voices.filter(v=>/^en[-_]/i.test(v.lang)&&v.localService!==false);
 for(const lang of ['en-us','en-gb']){const match=english.find(v=>v.lang.replace('_','-').toLowerCase()===lang);if(match)return match}
 return english[0]??null;
}
export function speechText(text:string):string{return text.replace(/\s+/g,' ').trim().slice(0,SPEECH_MAX)}
