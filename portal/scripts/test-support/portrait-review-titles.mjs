// Isolated visual fixtures only; never written to production records.
export function portraitReviewTitle(index,fallback){
 if(process.env.PORTRAIT_TITLE_REVIEW!=='1')return fallback;
 return ({0:'Senior wellness together',2:'社区乐龄活动与健康生活分享让长者与家人共同参与社区关怀计划并建立更紧密的联系与友谊',3:'Helping seniors stay active and connected through meaningful community activities, shared learning and healthier living',7:'GLOW 社区乐龄活动 — Supporting seniors and families through meaningful programmes, friendship and lifelong learning'})[index]||fallback;
}
