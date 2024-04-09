const dotenv = require('dotenv')
dotenv.config()
const { connect } = require('./database/dbConfig')
const express = require("express")
const cors = require("cors")
const router = require("./routes")

// database connect func
connect()

// express and middlwares
const app = express()
app.use(express.json())
app.use(cors())
app.use(router)

const Port = process.env.PORT || 8000

app.listen(Port)