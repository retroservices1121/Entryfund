import { createHash } from "crypto";

export function idempotencyKey(parts:(string|number)[]){
 return createHash("sha256").update(parts.join(":")).digest("hex");
}
