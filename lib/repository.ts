import { query } from "./db";

export async function getOrganizer(id:string){
 const result=await query("SELECT * FROM organizers WHERE id=$1 LIMIT 1",[id]);return result.rows[0]??null;
}
export async function listCollections(organizerId:string){
 const result=await query("SELECT * FROM collections WHERE organizer_id=$1 ORDER BY event_date DESC NULLS LAST,created_at DESC",[organizerId]);return result.rows;
}
export async function getCollectionBySlug(organizerId:string,slug:string){
 const result=await query("SELECT * FROM collections WHERE organizer_id=$1 AND slug=$2 LIMIT 1",[organizerId,slug]);return result.rows[0]??null;
}
export async function getCollectionLedger(collectionId:string){
 const [registrations,expenses,awards,refunds]=await Promise.all([
  query("SELECT * FROM registrations WHERE collection_id=$1 ORDER BY created_at DESC",[collectionId]),
  query("SELECT * FROM expenses WHERE collection_id=$1 ORDER BY created_at DESC",[collectionId]),
  query("SELECT * FROM awards WHERE collection_id=$1 ORDER BY created_at DESC",[collectionId]),
  query("SELECT r.* FROM refunds r JOIN registrations reg ON reg.id=r.registration_id WHERE reg.collection_id=$1 ORDER BY r.created_at DESC",[collectionId]),
 ]);
 return {registrations:registrations.rows,expenses:expenses.rows,awards:awards.rows,refunds:refunds.rows};
}
