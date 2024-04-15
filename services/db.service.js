import sql from "mssql";
import  config  from "../configs/db.config.js";

export default async function query(query, params, types) {
    
  await sql.connect(config);
  const req = new sql.PreparedStatement();

  if (types) {
    for (const [key, value] of Object.entries(types)) {
      req.input(key, value);
    }
  }

  try {
    await req.prepare(query);
    const res = await req.execute(params);
    return res.recordset;
  } catch (err) {
    throw err;
  }
}