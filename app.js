const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mssql = require('mssql/msnodesqlv8');
const bcrypt = require('bcrypt');

const app = express();
const port = 4000;


const connection = new mssql.ConnectionPool({
  database: "Hotel Eden",
  server: "DESKTOP-FURIRO", //"(localdb)\\MSSQLlocaldb" 
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
  }
});

app.use(cors({
  origin: "*"
}));
/* app.use(cors()) */;

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
    //email = ?, [identifier] sql injection hack proof 
    if (result.recordset.length > 0) { //verificar se tem um resultado
      res.status(200).send(result.recordset[0]) //return value
      console.log(result.recordset[0])
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
  const { pNome, sNome, email, nacionalidade, morada, dataNasc, telefone, password, documento } = req.body;
  //console.log(req)
  try {
    await connection.connect(); //conectar com a database
    const result = await connection.query`insert into Clientes (Nome, SobreNome, Nacionalidade, DataNasc, Telefone, Morada, NIF, Email, PalavraPasse) 
    values (${pNome}, ${sNome}, ${nacionalidade}, ${dataNasc}, ${telefone}, ${morada}, ${documento}, ${email}, ${password})`

    //get user name and code
    const getCodCli = await connection.query`select CodCli, Nome from clientes where Email = ${email} and PalavraPasse = ${password}`
    console.log("insert successfull status 200")
    console.log(getCodCli.recordset[0])

    res.status(200).send(getCodCli.recordset[0])
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
    //console.log(res)
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
  //console.log(req)

  try {
    await connection.connect();
    if (dataEntrada < dataSaida) {
      console.log("data aceitável")
      //console.log(req)

      const response = await connection.query`insert into Reservas (CodCli, NumPessoas, DataEntrada, DataSaida) 
        values (${CodCli},${nPessoas}, ${dataEntrada}, ${dataSaida})
        select scope_identity() as Id_Reserva`
        console.log(response.recordset[0].Id_Reserva) //isto é bué pro

      await connection.query`insert into QuartosReservas(Id_Reserva, NumQuarto, DataEntrada, DataSaida) 
        values ( ${response.recordset[0].Id_Reserva},${numQuarto},${dataEntrada},${dataSaida})`
        console.log("yes")


      const result4 = await connection.query(`select TipoQuarto.Preco from Quartos 
        inner join TipoQuarto on TipoQuarto.TipoQuarto = Quartos.TipoQuarto
        where Quartos.NumQuarto = ${numQuarto}`)

      let { Preco } = result4.recordset[0];
      console.log(Preco) 

      const result5 = await connection.query(`insert into Billing(Bill, CodCli) 
        values (${Preco}, ${CodCli})`) //billing está a criar coluns diferentes invês de adicionar a um único CodCli, fuckit 

      console.log("all querys successfull")
      //res.status(200).send(getID.recordset[0])
      res.status(200).send()
    }
    else {
      res.status(401).send("Data de entrada deve ser antes da data de saída ")
    }
  }

  catch {
    res.status(500).send('Erro na reserva de quarto')
  }

  finally {
    await connection.close();
  }
})

app.get("/getReserves", async (req, res) => {
  const { CodCli } = req.query
  console.log("get reserves called")

  try {
    await connection.connect();
    //const result = await connection.query`select numQuarto, dataEntrada, dataSaida, nPessoas from reservas where ${CodCli} = CodCli`

    const result = await connection.query`select QuartosReservas.Id_Reserva,QuartosReservas.NumQuarto,Reservas.DataEntrada, Reservas.DataSaida, Reservas.NumPessoas  
    from Reservas
    inner join QuartosReservas on Reservas.Id_Reserva = QuartosReservas.Id_Reserva
    where CodCli = ${CodCli} `
    //console.log(resultN.recordset[0]) //undefined somehow
    res.json(result.recordset)
  }

  catch (err) {
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