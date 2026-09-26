"use client";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="shell" style={{paddingTop:80,paddingBottom:80}}><div className="form-card"><div className="eyebrow">EntryFund</div><h1>Something went wrong.</h1><p className="muted">Your financial data has not been changed. Try the request again.</p><button className="btn btn-primary" onClick={reset}>Try again</button></div></main>
}