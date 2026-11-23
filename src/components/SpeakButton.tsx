import {SpeakerHigh,SpeakerSimpleLow} from '@phosphor-icons/react';
import type {useSpeech} from '../lib/useSpeech';
export function SpeakButton({text,slow=false,label,speech}:{text:string;slow?:boolean;label?:string;speech:ReturnType<typeof useSpeech>}){
 if(!speech.voice)return null;const description=label??(slow?'Nghe chậm':'Nghe phát âm');return <button type="button" className="icon-button speak-button" aria-label={description} title={description} onClick={e=>{e.stopPropagation();speech.speak(text,slow)}}>{slow?<SpeakerSimpleLow size={16}/>:<SpeakerHigh size={16}/>}</button>;
}
