const { MongoClient } = require("mongodb")
const { ObjectID } = require('mongodb')
const dbname = "crud_mongo"
const dev_url = "mongodb://localhost:27017"
const url = process.env.MONGODB_URI || dev_url
const mongoOptions = { useNewUrlParser: true }

const state = {
    //this we signify we dont have a database yet 
    db: null
}
//connect mongo to db
const connect = (cb) => {
    if (state.db) {
        //if there is a database connection call the callback
        cb()
    } else {
        MongoClient.connect(url, mongoOptions, (err, client) => {
            if (err)
                cb(err)
            else {
                state.db = client.db(dbname)
                cb()
            }
        })
    }
}

//get primary key
const getPrimaryKey = (_id) => {
    //this below will return an object id which will be used to query the data base to fnd the primary key
    return ObjectID(_id)
}

//get db
const getDB = () => {
    return state.db
}

module.exports = { getDB, connect, getPrimaryKey }