const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mssql = require('mssql/msnodesqlv8');
const bcrypt = require('bcrypt');

const app = express();
const port = 4000;


const connection = new mssql.ConnectionPool({
  database: "Hotel Eden",
  server: "(localdb)\\MSSQLlocaldb",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true
  }
});

app.use(cors({
  origin: "*"
}));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.post('/login', async (req, res) => { //pegar data do front para verificar com a data da base de dados
  const { identifier, password } = req.body;

  console.log("pass is " + password)
  console.log("identifier is " + identifier)

  try {
    await connection.connect(); //conectar com a database

    const result = await connection.query`select * from Clientes where Email=${identifier} and PalavraPasse=${password}`; //checar credenciais 

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

app.post('/register', async (req, res) => { //pegar data do front para verificar com a data da base de dados
  console.log("-register called")
  const { pNome, sNome, email, nacionalidade, morada, telefone, password, documento } = req.body;

  try {
    await connection.connect(); //conectar com a database
    const result = await connection.query`insert into Clientes (Nome, SobreNome, Nacionalidade, telefone, morada, NIF, Email, PalavraPasse) 
    values (${pNome}, ${sNome}, ${nacionalidade}, ${telefone}, ${morada}, ${documento}, ${email}, ${password})`
    res.send(ok)
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

app.post("/reservar", async (req, res) => {
  const { numQuarto, dataEntrada, dataSaida, nPessoas, CodCli } = req.body
  console.log(req)

  try {
    await connection.connect();

    if (dataEntrada < dataSaida) {
      console.log("data aceitável por enquanto")
      const result1 = await connection.query`select * from QuartosReservas where Numquarto = ${numQuarto} ` //adicionar as datas depois de testar
      console.log("resultados = " + result1.recordset.length)

      if (result1.recordset.length == 0) { //==, também vai ser mudado consoante o query de verificar a data
        console.log("if successful")
        const result2 = await connection.query`insert into Reservas (CodCli, NumPessoas, DataEntrada, DataSaida) 
        values (${CodCli},${nPessoas}, ${dataEntrada}, ${dataSaida})`

        const result3 = await connection.query`insert into QuartosReservas(NumQuarto, DataEntrada, DataSaida) 
        values (${numQuarto},${dataEntrada},${dataSaida}) `

        const result4 = await connection.query(`select TipoQuarto.Preco from Quartos 
        inner join TipoQuarto on TipoQuarto.TipoQuarto = Quartos.TipoQuarto
        where Quartos.NumQuarto = ${numQuarto}`)

        let { Preco } = result4.recordset[0];
        console.log(Preco)

        const result5 = await connection.query`insert into Billing(Bill, CodCli) 
        values (${Preco}, ${CodCli}) `
        console.log
      }
    }
  }

  catch {
    res.status(401).send('credenciais inválidas')
  }

  finally {
    await connection.close();
  }
})

app.get("/getReserves", async (req, res) => {
  try {
    await connection.connect();
    const result = await connection.query`select numQuarto, dataEntrada, dataSaida, nPessoas from reservas`
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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})