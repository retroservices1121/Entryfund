import { redirect } from "next/navigation";

export default async function LegacyFeePage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{returned?:string}>}){
 const {id}=await params;
 const {returned}=await searchParams;
 redirect(`/pay/fee/${encodeURIComponent(id)}${returned==="1"?"?returned=1":""}`);
}
