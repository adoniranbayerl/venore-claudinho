import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";

export async function findAllUsers() {
  return db.select({ id: users.id, name: users.name, email: users.email, status: users.status }).from(users);
}
