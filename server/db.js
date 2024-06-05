// работа с БД
import pg from "pg";
const { Pool } = pg;
import { useRuntimeConfig } from "#imports";

const config = useRuntimeConfig();

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export default pool;
