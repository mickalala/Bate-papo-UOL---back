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

mongoClient.connect().then(() => db = mongoClient.db())

app.post("/participants", async (req, res) => {
    const { name } = req.body
    const validate = nameSchema.validate(req.body)
    if (validate.error) return res.sendStatus(422)
try{
    const newUser= await db.collection("participants").findOne({name: name})
    if (newUser) return res.status(409).send("Esse user já existe!")
    await db.collection("participants").insertOne({
        name: name,
        lastStatus: Date.now()
    })
   await db.collection("messages").insertOne({
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    })
} catch(err) {
    res.status(500).send(err.message)
}
})

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then(partics => res.send(partics))
        .catch(() => res.sendStatus(500))
})

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body
    const user = req.headers.user

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().required()
    })

    const messageValid = messageSchema.validate(req.body)
    if (messageValid.error) return res.sendStatus(422)

    db.collection("messages").insertOne(
        {
            from: user,
            to: to,
            text: text,
            type: type,
            time: dayjs().format('HH:mm:ss')
        })
        .then(() => res.sendStatus(201))
        .catch(err => res.send(500))
}

)

app.get("/messages", (req, res) => {
    const user = req.headers.user

    db.collection("messages").find({$or:[{from: user}, {to: 'Todos'}, {to: user}]}).toArray()
        .then(msgs => res.send(msgs))
        .catch(() => res.sendStatus(500))
})


app.post("/status", (req, res) => {
    const user = req.headers.user
    if (!user) return res.sendStatus(404)
    const list = db.collectio("participants").findOne({ name: user })
    if (!list) return res.sendStatus(404)
})

const PORT = 5000;
app.listen(PORT, () => console.log(`tá rodando na portaaa ${PORT}`))