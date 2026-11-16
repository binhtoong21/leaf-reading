import {useEffect,useRef,type ReactNode} from 'react';
import {X} from '@phosphor-icons/react';
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=ref.current!;el.showModal();return()=>el.close()},[]);
 return <dialog ref={ref} className={wide?'modal wide':'modal'} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><header><h2>{title}</h2><button className="icon-button" aria-label="Đóng" onClick={onClose}><X size={20}/></button></header>{children}</dialog>;
}
