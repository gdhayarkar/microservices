const express = require('express');
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto');
const cors = require('cors')
const app = express();
const axios = require('axios')
app.use(cors())
app.use(bodyParser.json());
const commentsByPostid = {};

app.get('/posts/:id/comments',(req,res)=>{
    res.send(commentsByPostid[req.params.id]||[])
});
app.post('/posts/:id/comments',async (req,res)=>{
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;
    const comments = commentsByPostid[req.params.id] || [];

    comments.push({id: commentId, content,status:'pending'});
    commentsByPostid[req.params.id]= comments;
    await axios.post('http://event-bus-srv:4005/events',
        {
            type:'CommentCreated',
            data:{
                id: commentId, 
                content,
                status:'pending',
                postId:req.params.id
            }   
        })
    res.status(201).send(comments)
})

app.post('/events',async (req,res)=>{
    console.log('received event',req.body.type)
    const { postId,id, status,content}= req.body.data
    if(req.body.type === 'CommentModerated'){
        const comments = commentsByPostid[postId];
        const comment = comments.find( comnt =>{
            return comnt.id===id;
        })
        comment.status = status;
        await axios.post('http://event-bus-srv:4005/events',{
            type:'CommentUpdated',
            data :{
                id,
                status,
                postId,
                content
            }
        })
    }
    res.send({})
})

app.listen(4001,()=>{
    console.log('comments listening on 4001')
})