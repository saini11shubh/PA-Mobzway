const bodyParser = require('body-parser');
const { response } = require('express');
const express = require('express');
const { restart } = require('nodemon');
const app = express();
const port = process.env.PORT || 3000;
const redis = require('redis')
const client = redis.createClient();
const mongoose = require("./conn.js");
const UserData = require("./schema.js")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


client.on('connect', () => console.log('Connected to Redis!'));
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();
var result = [];
app.get("/", async (req, res) => {
    await UserData.find({}).then(data => {
        result = data;                  //store mongodb data array in result array 
        console.log("database")
        //   client.set('postData', JSON.stringify(data));           //convert data in string and save on redis
        // res.send("data success go to /users page")
        //console.log(data);
    }).catch(err => {
        console.log(err);
    })

    let keyname = 'postData';                   //set value in redis through key
    let getredisvalue = await client.get(keyname);    //get value from redis through key
    let responseDataArray = '';                       //create Array and show response
    if (getredisvalue) {
        // console.log(getredisvalue)
        responseDataArray = JSON.parse(getredisvalue);
        console.log("get data from redis")
    }
    else {
        console.log(getredisvalue)
        // console.log(result);
        console.log("set data in redis");
        client.set(keyname, JSON.stringify(result));
        responseDataArray = result;
    }
    res.send(responseDataArray);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})