const express = require('express')
const bodyParser = require('body-parser')
var compression = require('compression');
//Helmet is a middleware package. It can set appropriate HTTP headers that help protect your app from well-known web vulnerabilities (see the docs for more information on what headers it sets and vulnerabilities it protects against). 
var helmet = require('helmet');
const app = express()
app.use(bodyParser.json())
app.use(compression()); //Compress all routes
const path = require('path')
const db = require('./db')
const joi = require("joi")
//a schema is a blueprint that an obj has to follow
const schema = joi.object().keys({
    //make sure the object i.e todo is a string and is not empty
    todo: joi.string().required()
})
// we will have a database that contains a collection called todo
const collection = "todo"

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
app.get('/getTodos', (req, res) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err) {
            console.log(err)
        } else {
            console.log(documents)
            res.json(documents)
            //control C and run mongo in terminal
            //create a db
            //  -------   use crud_mongo
            //to use a collection
            //-------- db.todo.insert({todo:"i love you"})

        }
    })
})

//update portion of our crud app
app.put('/:id', (req, res) => {
    const todoID = req.params.id
    const userInput = req.body
    db.getDB().collection(collection).findOneAndUpdate({ _id: db.getPrimaryKey(todoID) }, { $set: { todo: userInput.todo } }, { returnOriginal: false }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.json(result)
        }
    })
})
//create a new todo
app.post('/', (req, res, next) => {
    const userInput = req.body
    //first arg is the object you want to validate, second is the schema or blueprint
    joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error("invalid input")
            error.status = 400
            next(error)
        } else {
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                if (err) {
                    const error = new Error("failed to insert todo doc")
                    error.status = 400
                    next(error)
                }
                else
                    //result is an object that will contain {"n";1,"ok":1} where n is the amount inserted while result.ops[0] will contain the todo and the id
                    //to make it easier for the frontend, we will pass a message which will be displayed
                    res.json({ result: result, document: result.ops[0], msg: "successfully inserted Todo!!!", error: null })
            })
        }
    })

})
//custom middle ware create our error message
app.use((err, req, res, next) => {
    res.status(err.status).json({
        error: {
            message: err.message
        }
    })
})
//delet a tofo
app.delete('/:id', (req, res) => {
    const todoID = req.params.id;
    db.getDB().collection(collection).findOneAndDelete({ _id: db.getPrimaryKey(todoID) }, (err, result) => {
        if (err)
            console.log(err)
        else
            res.json(result)
    })
})
//connect to our db
db.connect((err) => {
    if (err) {
        console.log('unable to connet to database')
        process.exit(1)
    } else {
        app.listen(3000, () => {
            console.log('connected to database app listening on port 3000')
        })
    }
})