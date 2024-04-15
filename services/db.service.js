import sql from "mssql";
import config from "../configs/db.config.js";

export const connection = new sql.ConnectionPool(config);