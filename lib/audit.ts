export type AuditEvent={
 action:string;actorId:string;organizerId:string;entityType:string;entityId:string;
 metadata?:Record<string,string|number|boolean|null>;createdAt:string;
};

export function audit(event:Omit<AuditEvent,"createdAt">){
 const record:AuditEvent={...event,createdAt:new Date().toISOString()};
 // Replace with persistent audit sink when DATABASE_URL is connected.
 console.info(JSON.stringify({kind:"entryfund.audit",...record}));
 return record;
}
