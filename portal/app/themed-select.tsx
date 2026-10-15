'use client';

import * as React from 'react';
import {Select as Primitive} from 'radix-ui';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';

export const Select=Primitive.Root;
export const SelectGroup=Primitive.Group;
export const SelectValue=Primitive.Value;
export function SelectTrigger({className='',children,...props}:React.ComponentProps<typeof Primitive.Trigger> & {size?:'sm'|'default'}){
 const {size,...trigger}=props;
 return <Primitive.Trigger {...trigger} data-size={size} className={'themed-select-trigger '+className}>{children}<Primitive.Icon asChild><ChevronDown size={16} aria-hidden="true" className="themed-select-chevron"/></Primitive.Icon></Primitive.Trigger>;
}
export function SelectScrollUpButton(props:React.ComponentProps<typeof Primitive.ScrollUpButton>){return <Primitive.ScrollUpButton {...props} className={'themed-select-scroll '+(props.className||'')}><ChevronUp size={16} aria-hidden="true"/></Primitive.ScrollUpButton>;}
export function SelectScrollDownButton(props:React.ComponentProps<typeof Primitive.ScrollDownButton>){return <Primitive.ScrollDownButton {...props} className={'themed-select-scroll '+(props.className||'')}><ChevronDown size={16} aria-hidden="true"/></Primitive.ScrollDownButton>;}
export function SelectContent({children,className='',position='popper',align='start',...props}:React.ComponentProps<typeof Primitive.Content>){return <Primitive.Portal><Primitive.Content position={position} align={align} sideOffset={8} collisionPadding={12} onEscapeKeyDown={e=>e.stopPropagation()} {...props} data-themed-select-menu="" className={'themed-select-menu '+className}><SelectScrollUpButton/><Primitive.Viewport className="themed-select-viewport">{children}</Primitive.Viewport><SelectScrollDownButton/></Primitive.Content></Primitive.Portal>;}
export function SelectItem({children,className='',...props}:React.ComponentProps<typeof Primitive.Item>){return <Primitive.Item {...props} className={'themed-select-option '+className}><Primitive.ItemText>{children}</Primitive.ItemText><Primitive.ItemIndicator className="themed-select-check"><Check size={16} aria-hidden="true"/></Primitive.ItemIndicator></Primitive.Item>;}
export function SelectLabel(props:React.ComponentProps<typeof Primitive.Label>){return <Primitive.Label {...props} className={'themed-select-label '+(props.className||'')}/>;}
export function SelectSeparator(props:React.ComponentProps<typeof Primitive.Separator>){return <Primitive.Separator {...props} className={'themed-select-separator '+(props.className||'')}/>;}

export type SelectOption={value:string;label:React.ReactNode;disabled?:boolean};
function textValue(node:React.ReactNode):string{return React.Children.toArray(node).map(child=>React.isValidElement<{children?:React.ReactNode}>(child)?textValue(child.props.children):String(child)).join('');}
// Option elements are configuration only; the browser never renders their native UI.
export function selectOptions(children:React.ReactNode,parentDisabled=false):SelectOption[]{return React.Children.toArray(children).flatMap(child=>{
 if(!React.isValidElement<{value?:string|number;children?:React.ReactNode;disabled?:boolean}>(child))return [];
 if(child.type==='option')return [{value:String(child.props.value??textValue(child.props.children)),label:child.props.children,disabled:parentDisabled||child.props.disabled}];
 return selectOptions(child.props.children,parentDisabled||child.props.disabled);
});}
type Props=Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,'value'|'defaultValue'|'onChange'|'children'> & {value?:string|number;defaultValue?:string|number;onValueChange?:(value:string)=>void;children?:React.ReactNode;options?:SelectOption[];name?:string;required?:boolean;placeholder?:string;renderIcon?:(value:string)=>React.ReactNode};
export default function ThemedSelect({value,defaultValue,onValueChange,children,options,required,name,placeholder,renderIcon,disabled,...trigger}:Props){
 const [local,setLocal]=React.useState(String(defaultValue??''));
 const current=String(value??local),entries=options??selectOptions(children),selected=entries.find(o=>o.value===current),encode=(v:string)=>'option:'+v;
 return <><Select value={required&&current===''?'':encode(current)} onValueChange={next=>{const decoded=next.slice(7);setLocal(decoded);onValueChange?.(decoded);}} required={required} disabled={disabled}>
  <SelectTrigger {...trigger}><span className="themed-select-value">{renderIcon?.(current)}<SelectValue placeholder={placeholder}>{selected?.label??placeholder??current}</SelectValue></span></SelectTrigger>
  <SelectContent>{entries.map(option=><Primitive.Item key={option.value} value={encode(option.value)} disabled={option.disabled} textValue={textValue(option.label)} className="themed-select-option">{renderIcon?.(option.value)}<Primitive.ItemText>{option.label}</Primitive.ItemText><Primitive.ItemIndicator className="themed-select-check"><Check size={16} aria-hidden="true"/></Primitive.ItemIndicator></Primitive.Item>)}</SelectContent>
 </Select>{name&&<input type="hidden" name={name} value={current} disabled={disabled}/>}</>;
}
