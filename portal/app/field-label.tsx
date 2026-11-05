import {Children,isValidElement,type ReactNode} from 'react';

export function hasRequiredControl(children:ReactNode):boolean{
 return Children.toArray(children).some(child=>isValidElement<{required?:boolean;children?:ReactNode}>(child)&&(child.props.required===true||hasRequiredControl(child.props.children)));
}

export default function FieldLabel({children,required=false}:{children:ReactNode;required?:boolean}){
 return <span className="field-label">{children}{required&&<> <span className="required-marker" role="img" aria-label="Required">*</span></>}</span>;
}
