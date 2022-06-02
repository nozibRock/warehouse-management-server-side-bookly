const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


//  middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.26oam.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyToken(req, res, next) {
  //getting token from header
  const tokenInfo = req.headers.authorization;
  const token = tokenInfo?.split(" ")[1];
  if (!tokenInfo) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("bookly").collection("books");

    // Auth
    // JWT
    // token while logging in
    app.post('/signIn', (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    });

    // book API
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

    // POST
    app.post("/book", async (req, res) => {
      const newBook = req.body;
      const result = await bookCollection.insertOne(newBook);
      res.send(result);
    });

    //DELETE
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
      const result = await bookCollection.updateOne(
        filter,
        updateQuantity,
        options
      );
      res.send(result);
    });

    //product list, when token is verified
    app.get("/productList", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = {email : email};
        const cursor = bookCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({message: "forbidden access"});
      }
    });

    app.post("/addBook", async (req, res) => {
      const productInfo = req.body;
      const result = await bookCollection.insertOne(productInfo);
      res.send({ success: "Successful" });
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

app.get('/hero', (req, res) => {
    res.send('Hero meets heroku');
})

app.listen(port, (req, res) => {
    console.log('Listening to port', port)
})