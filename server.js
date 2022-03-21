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
                views: {
                    'conversation': {
                        //information about each view
                        //this is abstracted
                        greetingText: "Hello! Welcome to my app!",
                        //viewSecret: null
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
    if(data[req.params.username].pages[req.params.page].views[req.params.view].viewSecret !== undefined) {
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

const validateExistence = (req, res) => {
    if(data[req.params.username] !== undefined) {
        //user exists
        if(data[req.params.username].pages[req.params.page] !== undefined) {
            //page exists
            if(data[req.params.username].pages[req.params.page].views[req.params.view] !== undefined) {
                //view exists
                return true
            }
            else {
                res.status(400).send({message: 'View not found'})
                return false;
            }
        }
        else {
            res.status(400).send({message: 'Page not found'})
            return false;
        }
    }
    else {
        res.status(400).send({message: 'Username not found'})
    }
    return false;
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

//redirect to default view of default page
app.get("/:username", (req,res) => {
    if(data[req.params.username] === undefined) {
        //user doesn't exist
        res.status(400).send({message: "user not found"})
        return
    }
    try {
        const dpage = data[req.params.username].defaultPage
        res.redirect(`/${req.params.username}/${dpage}`)
    }
    catch(err) {
        console.log(err)
        res.status(500).send({message: err})
    }
})

//create new user or update user
app.post("/:username", (req, res) => {
    if(req.body.update === true) {
        //update the existing user
        //authenticate the user
        if(req.body.secret !== data[req.params.username].secret) {
            //wrong key
            console.log("reached")
            res.status(400).send({message: "wrong user secret"})
            return
        }

        //modify the details
        data[req.params.username].secret = req.body.user.secret || data[req.params.username].secret
        data[req.params.username].defaultPage = req.body.user.defaultPage || data[req.params.username].defaultPage
        res.status(400).send({message: "user modified successfully"})
        return
    }

    //create a new user
    if(data[req.params.username] !== undefined) {
        //use already exists
        //can't create
        res.status(400).send({message: "user already exists"})
        return
    }
    data[req.params.username] = req.body.user || {pages: {}}
    res.status(200).send({message: "user created successfully"})
})

//delete the user
app.delete("/:username", (req, res) => {
    if(data[req.params.username] === undefined) {
        //user doesn't exist
        res.status(400).send({message: "username doesn't exist"})
        return
    }
    //authenticate user
    if(req.body.secret !== data[req.params.username].secret) {
        //wrong secret key
        res.status(400).send({message: "wrong user secret"})
        return
    }
    //delete the user
    delete data[req.params.username]
    res.status(200).send({message: "user deleted successfully"})
})

//redirect to default view of the page
app.get("/:username/:page", (req, res) => {
    if(data[req.params.username] === undefined) {
        res.status(400).send({message: "user not found"})
        return
    }
    else if(data[req.params.username].pages[req.params.page] === undefined) {
        res.status(400).send({message: "page not found"})
        return
    }
    try {
        const dview = data[req.params.username].pages[req.params.page].defaultView
        res.redirect(`/${req.params.username}/${req.params.page}/${dview}`)
    }
    catch(err) {
        console.log(err)
        res.status(500).send({message: err})
    }
})

//create a new page or update existing page
app.post('/:username/:page', (req,res) => {
    if(req.body.update === true) {
        //modify the page

        //authenticate
        if(req.body.secret !== data[req.params.username].secret) {
            //wrong key
            res.status(400).send({message: "wrong user secret"})
            return
        }

        //modify
        data[req.params.username].pages[req.params.page].defaultView = req.body.page.defaultView || data[req.params.username].pages[req.params.page].defaultView
        res.status(200).send({message: "page modified successfully"})
        return
    }

    //create a new page
    if(data[req.params.username].pages[req.params.page] !== undefined) {
        res.status(400).send({message: "page already exists"})
        return
    }
    data[req.params.username].pages[req.params.page] = req.body.page || {views: {}}
    res.status(200).send({message: "page created successfully"})
})

//return the requested view
app.get("/:username/:page/:view/", (req, res) => {
    if(!validateExistence(req,res)) return //validate whether username, page and view exists
    if(!authenticateView(req, res)) return
    console.log(req.params.username, req.params.page, req.params.view)
    console.log(data[req.params.username].pages[req.params.page].views[req.params.view])
    res.status(200).send(data[req.params.username].pages[req.params.page].views[req.params.view])
})

//create a new view or modify an existing one
app.post("/:username/:page/:view/", (req, res) => {
    if(req.body.update === true) {
        //modify the view

        //view authentication is different
        if(!authenticateView(req, res)) return

        //modify
        data[req.params.username].pages[req.params.page].views[req.params.view] = req.body.view || data[req.params.username].pages[req.params.page].views[req.params.view]
        res.status(200).send({message: "view modified successfully"})
        return
    }

    data[req.params.username].pages[req.params.page].views[req.params.view] = req.body.view || {}
    res.status(400).send({message: 'view created successfully'})
})

//delete a page
app.delete("/:username/:page", (req, res) => {

    //authenticate
    if(req.body.secret !== data[req.params.username].secret) {
        //wrong key
        res.status(400).send({message: "wrong user secret"})
        return
    }

    delete data[req.params.username].pages[req.params.page]
    res.status(200).send({message: "page deleted successfully"})
}) 

//delete a view
app.delete("/:username/:page/:view/", (req, res) => {

    //different authentication for views
    if(!authenticateView(req, res)) return

    try {
        delete data[req.params.username].pages[req.params.page].views[req.params.view]
        res.status(200).send({message: "view deleted successfully"})
    }
    catch(err) {
        res.status(500).send({message: err})
    }

})


app.listen(port, () => console.log(`listening on port ${port}`))