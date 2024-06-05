import pool from "../db";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event);

  if (method === "GET") {
    const { rows } = await pool.query("SELECT * FROM nodes");
    return rows;
  }

  if (method === "POST") {
    const body = await readBody(event);
    const { name, voltage, connected } = body;
    const { rows } = await pool.query(
      // "INSERT INTO nodes (name, voltage, connected) VALUES ($1, $2, $3) RETURNING *",
      [name, voltage, connected]
    );
    return rows[0];
  }
});
