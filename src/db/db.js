import Dexie from "dexie";

export const db = new Dexie("campusfind_db");

db.version(1).stores({
  posts: "id,type,category,status,createdAt" 
});