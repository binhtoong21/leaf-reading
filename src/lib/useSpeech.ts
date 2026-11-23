import {useEffect,useRef,useState} from 'react';
import {pickEnglishVoice,speechText} from './speech';
let currentSpeaker:symbol|null=null;
export function useSpeech(){
 const supported=typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;const [ready,setReady]=useState(false);const [voice,setVoice]=useState<SpeechSynthesisVoice|null>(null);const speaker=useRef<symbol|null>(null);if(!speaker.current)speaker.current=Symbol();
 useEffect(()=>{if(!supported)return;const load=()=>{const voices=window.speechSynthesis.getVoices();setVoice(pickEnglishVoice(voices));if(voices.length)setReady(true)};const changed=()=>{load();setReady(true)};load();window.speechSynthesis.addEventListener('voiceschanged',changed);return()=>{window.speechSynthesis.removeEventListener('voiceschanged',changed);if(currentSpeaker===speaker.current){window.speechSynthesis.cancel();currentSpeaker=null}}},[supported]);
 const speak=(text:string,slow=false)=>{const value=speechText(text);if(!voice||!value||!supported)return;try{const utterance=new SpeechSynthesisUtterance(value);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=slow?.7:.95;utterance.onend=utterance.onerror=()=>{if(currentSpeaker===speaker.current)currentSpeaker=null};window.speechSynthesis.cancel();currentSpeaker=speaker.current;window.speechSynthesis.speak(utterance)}catch{}};
 return {supported,ready,voice,speak};
}
