import express from "express";

const port = process.env.PORT || 9000; //use either the default port, or 9000 to listen
const app = express()


let testInbox = []
let testRead = []

let data = {
    'sajalsinghal': {
        //data about the username sajalsinghal
        defaultPage:'home',
        secret: 'secret',
        pages: {
            'home': {
                //information about each page
                defaultView: 'conversation',
                pageSecret: null, //open page
                views: {
                    'conversation': {
                        //information about each view
                        //this is abstracted
                        greetingText: "Hello! Welcome to my app!",
                        viewSecret: null,
                        messages: [
                            {
                                text:'sldkfa',
                                m: 'sd;lfjnas',
                                in: 12049
                            },
                            {
                                text: 'asdfl',
                                m: 'sdfsdfdsf',
                                in: 13232
                            }
                        ]
                    },
                    'todo': {
                        viewSecret: 'secret',
                        todos: [
                            {
                                task: 'Do this',
                                checked: false
                            },
                            {
                                task: 'Do that', 
                                checked: true
                            }
                        ]
                    }
                }
            }
        }
    }
}

//middlewares
app.use(express.json())
app.use((req, response, next) => {
    response.header('Access-Control-Allow-Origin', 'https://localhost:3000');           //allow requests from this address as a host
    response.header('Access-Control-Allow-Headers', '*');                               //allow all headers to come with incoming packets
    response.header('Access-Control-Allow-Methods', "GET, POST, OPTIONS, PUT, DELETE"); //allow get, post, options, put and delete methods
    next();                                                                             //move on to next middleware
})

//utility functions
const authenticateView = (req, res) => {
    if(data[req.params.username].pages[req.params.page].views[req.params.view].viewSecret !== null) {
        //password required
        if(req.body.viewKey !== data[req.params.username].pages[req.params.page].views[req.params.view].viewSecret) {
            //wrong password
            console.log("wrong view key")
            res.status(400).send({message: 'Wrong view key: maybe you are\'nt authorized?'})
            return false
        }
    }
    return true
}


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

app.get("/:username/:page/:view", (req, res) => {
    if(!authenticateView(req, res)) return
    console.log(req.params.username, req.params.page, req.params.view)
    console.log(data[req.params.username].pages[req.params.page].views[req.params.view])
    res.status(200).send(data[req.params.username].pages[req.params.page].views[req.params.view])
})

app.post("/:username/:page/:view/update", (req, res) => {
    if(!authenticateView(req, res)) return
    //authentication done
    data[req.params.username].pages[req.params.page].views[req.params.view] = req.body.modifiedView
    res.status(400).send({message: 'Modified successfully'})
})

app.post("/:username/:page/:view/delete", (req, res) => {
    if(!authenticateView(req, res)) return
})
app.listen(port, () => console.log(`listening on port ${port}`))