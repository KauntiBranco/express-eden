import express from "express";

export const authRouter = express.Router();

authRouter.post('/login', async (req, res) => { //pegar data do front para verificar com a data da base de dados
  console.log("login called")
  const { identifier, password } = req.body;

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

