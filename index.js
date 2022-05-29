const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

//  middleware
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.26oam.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log('Bookly warehouse db connected');
  // perform actions on the collection object
  client.close();
});


app.get('/', (req, res) => {
    res.send('Running Warehouse Server')
})

app.listen(port, (req, res) => {
    console.log('Listening to port', port)
})