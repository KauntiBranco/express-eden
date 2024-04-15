import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
 
import { bookingsRouter } from "./routes/bookings.js"
import { roomsRouter } from "./routes/rooms.js"
import { authRouter } from "./routes/auth.js"

const app = express();
const port = 4000;

app.use(cors({
  origin: "*"
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use("/reservas", bookingsRouter)
app.use("/quartos", roomsRouter)
app.use("/auth", authRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

