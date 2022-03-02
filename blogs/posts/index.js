const express = require('express')
const bodyParser= require('body-parser')
const {randomBytes}= require('crypto')
const cors = require('cors');
const axios  = require('axios');
const app = express();

app.use(cors())
app.use(bodyParser.json())
const posts = {}
app.get('/posts',(req,res)=>{
    res.send(posts);
})
app.post('/events',(req,res)=>{
    console.log('received event',req.body.type)
    res.send({})
})
app.delete('/posts/:id',(req,res)=>{
    delete posts[req.params.id]
    res.send({ message: `post with ${req.params.id} deleted successfully`})
})

app.put('/posts/:id',(req,res)=>{
    const {title}=req.body;
    const id = req.params.id;
    posts[id] = {
        id,title
    }
    res.send({ message: `put with ${req.params.id} updated successfully`})
})

app.post('/posts/create',async (req,res)=>{
    const id =randomBytes(4).toString('hex')
    const {title}=req.body;
    posts[id]= {
        id,title
    }
    await axios.post('http://event-bus-srv:4005/events',{
        type:'PostCreated',
        data:{
            id,title
        }
    })
    res.status(201).send(posts[id])
})
app.listen(4000,()=>{
    console.log('v2')
    console.log('posts listening on 4000')
})