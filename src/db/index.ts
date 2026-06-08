// Client Drizzle (postgres-js) — inicialização preguiçosa para não quebrar o build
// quando DATABASE_URL ainda não está configurada.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function init(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Configure o .env.local com a connection string do Supabase.",
    );
  }
  // Supabase: usar pooler (transaction mode) em serverless. prepare:false p/ pgbouncer.
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

/** Acesso ao banco. Conecta de fato apenas na primeira query. */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const instance = _db ?? init();
    // @ts-expect-error acesso dinâmico ao client drizzle
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
