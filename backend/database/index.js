const mongoose = require ('mongoose');
const {MONGODB_CONNECTION_STRING} = require('../config/index')

const dbConnect= async ()=> {
    try {
        const con = await mongoose.connect(MONGODB_CONNECTION_STRING);
        console.log(`the db is connected with ${con.connection.host}`)
        
    } catch (error) {
        console.log(error)
    }
}
module.exports = dbConnect;