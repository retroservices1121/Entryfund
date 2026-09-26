export class ValidationError extends Error{constructor(message:string){super(message);this.name="ValidationError"}}

export function cleanText(value:unknown,label:string,max=160){
 if(typeof value!=="string")throw new ValidationError(`${label} is required`);
 const v=value.trim();if(!v)throw new ValidationError(`${label} is required`);
 if(v.length>max)throw new ValidationError(`${label} is too long`);return v;
}
export function email(value:unknown){const v=cleanText(value,"Email",254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new ValidationError("Enter a valid email");return v}
export function positiveCents(value:unknown,label="Amount"){if(!Number.isInteger(value)||Number(value)<=0||Number(value)>100_000_000)throw new ValidationError(`${label} is invalid`);return Number(value)}
export function slug(value:unknown){const v=cleanText(value,"Slug",100);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v))throw new ValidationError("Slug is invalid");return v}
