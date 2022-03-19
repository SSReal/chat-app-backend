import express from "express";

const port = process.env.PORT || 9000; //use either the default port, or 9000 to listen
const app = express()


let testInbox = []
let testRead = []

//middlewares
app.use(express.json())
app.use((req, response, next) => {
    response.header('Access-Control-Allow-Origin', 'https://localhost:3000');           //allow requests from this address as a host
    response.header('Access-Control-Allow-Headers', '*');                               //allow all headers to come with incoming packets
    response.header('Access-Control-Allow-Methods', "GET, POST, OPTIONS, PUT, DELETE"); //allow get, post, options, put and delete methods
    next();                                                                             //move on to next middleware
})

app.get("/hello", (req, res) => {
    res.status(200).send("hello, I changed this!")
})

app.get("/testreceive", (req, res) => {
    res.status(200).send({messages: testInbox})
    //mark as read
    testRead = testRead.concat(testInbox)
    testInbox = []
})

app.get("/testreads", (req,res) => {
    res.status(200).send({messages: testRead})
})

app.post("/testsend", (req, res) => {
    console.log(req.body)
    testInbox.push(req.body)
    res.status(200).send(`sent ${req.body.text}`)
})

app.listen(port, () => console.log(`listening on port ${port}`))