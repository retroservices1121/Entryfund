type ProviderError={statusCode?:unknown;body?:unknown;requestId?:unknown};

function messageFromBody(body:unknown):string|null{
 if(typeof body==="string"){
  try{return messageFromBody(JSON.parse(body))}catch{return body}
 }
 if(!body||typeof body!=="object")return null;
 const fields=body as Record<string,unknown>;
 for(const key of ["message","detail","error_description","error"]){
  const value=fields[key];
  if(typeof value==="string")return value;
  if(value&&typeof value==="object"){
   const nested=messageFromBody(value);
   if(nested)return nested;
  }
 }
 return null;
}

export function cardErrorForOwner(error:unknown){
 const provider=(error&&typeof error==="object"?error:{}) as ProviderError;
 const status=typeof provider.statusCode==="number"?provider.statusCode:null;
 const requestId=typeof provider.requestId==="string"&&/^[a-zA-Z0-9_-]{4,100}$/.test(provider.requestId)
  ?provider.requestId:null;
 const raw=messageFromBody(provider.body);
 const detail=raw?.replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim().slice(0,240);
 const message=detail?`Whop says: ${detail}`
  :status===401||status===403?"Whop rejected this API key for card setup. Check the key's account permissions."
  :"Whop card setup failed. The account owner may need to finish verification or Whop may need to enable card issuing.";
 return {message,requestId,status};
}
