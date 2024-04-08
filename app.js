const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');
const bodyparser = require('body-parser');
const mssql = require('mssql/msnodesqlv8');
const bcrypt = require('bcrypt');


const connection = new mssql.ConnectionPool({
  database: "Hotel Eden",
  server: "(localdb)\\MSSQLlocaldb",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true
  }
}); "server=(localdb)\\MSSQLlocaldb"

app.use(cors({
  origin: "*"
}));

app.use(bodyparser.urlencoded({
  extended: false
}));
app.use(bodyparser.json());

app.post('/login', async (req, res) => { //pegar data do front para verificar com a data da base de dados
  console.log("login called")
  const { identifier, password } = req.body;

  console.log(req);
  console.log("pass is " + password)
  console.log("identifier is " + identifier)

  try {
    await connection.connect(); //conectar com a database

    const result = await connection.query`select * from Clientes where Email=${identifier} and PalavraPasse=${password}`; //checar credenciais
    console.log(identifier);
    console.log(password);
    console.log(result);

    if (result.recordset.length > 0) { //verificar se tem um resultado
      res.send(result.recordset[0]) //return value

    } else {
      res.status(401).send('credenciais inválidas')
    }
  }

  catch (err) {
    console.error(err)
    res.status(500).send('internal server error')
  }

  finally {
    await connection.close();
  }
})

app.get("/quartos", async (req, res) => {
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
}
)

app.post("/resevar", async (req, res) => {
  const { numQuarto, dataEntrada, dataSaida, nPessoas } = req.body
  console.log(req)
  try {
    await connection.connect();
    const result1 = await connection.query`select * from Reservas where Numquarto = ${numQuarto}` //adicionar as datas depois de testar

    if (result1.recordset.length = 0) {
      const result2 = await connection.query`insert into Reservas(Id_Reserva, DataEntrada, DataSaida, CodCli, NumPessoas) 
      values`
    const result3 = await connection.query`insert into QuartosReservas(Id_Reserva, NumQuarto) values () `
    }
    res.json(result.recordset)
  }
  catch {
    res.status(401).send('credenciais inválidas')
    console.log(res)
    console.err(err)
    res.status(500).send('internal server error')
  }
  finally {
    await connection.close();
  }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

