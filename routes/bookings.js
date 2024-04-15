import express from "express";
import { connection } from "../services/db.service.js"

export const bookingsRouter = express.Router();

bookingsRouter.get("/", async (req, res) => {
  const { numQuarto, dataEntrada, dataSaida, nPessoas, CodCli } = req.body
  console.log(req)
  try {
  // get all rooms
  }
  catch {
    res.status(500).send('internal server error')
  }

  finally {
    await connection.close(); }
})

bookingsRouter.post("/reservar", async (req, res) => {
  const { numQuarto, dataEntrada, dataSaida, nPessoas, CodCli } = req.body
  console.log(req)
  try {
    await connection.connect();
    console.log("primeiro")
    console.log(numQuarto)
    const result1 = await connection.query`select * from QuartosReservas where Numquarto = ${numQuarto} and DataInicial ` //adicionar as datas depois de testar
    console.log(result1.recordset.length)
    if (result1.recordset.length == 0) {
      console.log("if successful")
  //verificar se as datas são aceitaveis
      const result2 = await connection.query`insert into Reservas (CodCli, NumPessoas, DataEntrada, DataSaida) values 
      (${CodCli},${nPessoas}, ${dataEntrada}, ${dataSaida})`

      const result3 = await connection.query`insert into QuartosReservas(NumQuarto, DataEntrada, DataSaida) 
      values (${numQuarto},${dataEntrada},${dataSaida}) `
      }
  }

  catch {
    res.status(401).send('credenciais inválidas')
    console.log(res)
    console.err(err)
    res.status(500).send('internal server error')
  }

  finally {
    await connection.close(); }
})