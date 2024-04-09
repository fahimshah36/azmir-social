const mongoose = require('mongoose')

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("Databse Successfully connected");
    })
}