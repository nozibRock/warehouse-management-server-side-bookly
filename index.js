const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId} = require("mongodb");

//  middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.26oam.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("bookly").collection("books");

    app.get("/book", async (req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);
      const books = await cursor.toArray();
      res.send(books);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const book = await bookCollection.findOne(query);
      res.send(book);
    });

    // Add
    app.post("/book", async (req, res) => {
      const newBook = req.body;
      const result = await bookCollection.insertOne(newBook);
      res.send(result);
    });

    // Delete
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    });

    // Update Quantity
    app.put("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      const newQuantity = await req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateQuantity = {
        $set: {
          quantity: newQuantity.quantity,
        },
      };
      const result = await bookCollection.updateOne( filter, updateQuantity, options);
      res.send(result);
    });
  } 
  finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Warehouse Server')
})

app.listen(port, (req, res) => {
    console.log('Listening to port', port)
})