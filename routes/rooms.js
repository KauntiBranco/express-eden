import express from "express";
import { connection } from "../services/db.service.js";

export const roomsRouter = express.Router();

roomsRouter.get("/", async (req, res) => {
  try {
    await connection.connect();
    const result = await connection.query`select NumQuarto, Quartos.TipoQuarto, Descricao, Preco, Imagem
from Quartos 
inner join TipoQuarto on TipoQuarto.TipoQuarto = Quartos.TipoQuarto`
    res.json(result.recordset)
  }

  catch (err) {
    console.log(res)
    console.error(err)
    res.status(500).send('internal server error')
  }

  finally {
    await connection.close();
  }
})
