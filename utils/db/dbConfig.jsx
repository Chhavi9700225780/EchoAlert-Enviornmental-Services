import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://chhavidb_owner:U7WhjfJLdmI9@ep-muddy-credit-a85c8htf.eastus2.azure.neon.tech/chhavidb?sslmode=require"
  
);
export const db = drizzle(sql, { schema });
