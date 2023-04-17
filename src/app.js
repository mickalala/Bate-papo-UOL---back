import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"

const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db

const nameSchema = joi.object({
    name: joi.string().required()
})
const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required()
})

mongoClient.connect().then(() => db = mongoClient.db())

app.post("/participants", (req, res) => {
    const { nameBody } = req.body
    const validate = nameSchema.validate(req.body)
    if (validate.error) return res.sendStatus(422)



    console.log(dayjs().format('HH:mm:ss'))
    db.collection("participants").insertOne({
        name: nameBody,
        lastStatus: Date.now()
    }).then(() => res.sendStatus(201))
        .catch(() => res.sendStatus(500))
    db.collection("messages").insertOne({
        from: nameBody,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    }).then(() => res.sendStatus(201))
        .catch(() => res.sendStatus(500))
})

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then(partics => res.send(partics))
        .catch(() => res.sendStatus(500))
})

app.post("/messages", (req, res) => {

})
const PORT = 5000;
app.listen(PORT, () => console.log(`tá rodando na portaaa ${PORT}`))