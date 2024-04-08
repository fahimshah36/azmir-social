const express = require("express")

const app = express()


app.get('/', (req, res) => {
    res.send("This is home page")
})

app.get('/registration', (req, res) => {
    res.send("This is registration page")
})

app.listen(8000, () => {
    console.log("hello this is one year academy");
})