const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser= require('body-parser')

const app= express();
app.use(bodyParser.json())
app.use(cors())
const events = [];
app.post('/events',(req,res)=>{
    
    events.push(req.body);
    axios.post('http://posts-clusterip-srv:4000/events',req.body).catch((err)=>{
        console.log(err.message);
    }) ; //post service
    axios.post('http://comments-srv:4001/events',req.body).catch((err)=>{
        console.log(err.message);
    }) ; //comments service
    axios.post('http://query-srv:4002/events',req.body).catch((err)=>{
        console.log(err.message);
    }) ; //query service
    axios.post('http://moderation-srv:4003/events',req.body).catch((err)=>{
        console.log(err.message);
    }) //moderations
    res.send({status:'ok'})
})
app.get('/events',(req,res)=>{
    res.send(events)
})

app.listen(4005,()=>{
    console.log('event-bus listening on 4005 ')
})