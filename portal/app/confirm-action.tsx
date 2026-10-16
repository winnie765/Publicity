'use client';
import {useRef,useState,useEffect} from 'react';
import {Dialog} from 'radix-ui';
export function useConfirmAction(){const pending=useRef<((answer:boolean)=>void)|null>(null),[dialog,setDialog]=useState<{title:string;description:string;label:string}|null>(null);
 useEffect(()=>()=>pending.current?.(false),[]);
 function confirm(title:string,description='The record will move to Trash. You can restore it from Records & Trash.',label='Move to Trash'){pending.current?.(false);setDialog({title,description,label});return new Promise<boolean>(resolve=>{pending.current=resolve})}
 function finish(value:boolean){pending.current?.(value);pending.current=null;setDialog(null)}
 const confirmation=<Dialog.Root open={!!dialog} onOpenChange={open=>{if(!open)finish(false)}}><Dialog.Portal><Dialog.Overlay className="records-dialog-overlay"/><Dialog.Content className="records-dialog records-confirm"><Dialog.Title>{dialog?.title}</Dialog.Title><Dialog.Description>{dialog?.description}</Dialog.Description><div className="records-dialog-actions"><button className="button" onClick={()=>finish(false)} autoFocus>Cancel</button><button className="button destructive" onClick={()=>finish(true)}>{dialog?.label}</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
 return {confirm,confirmation};
}
