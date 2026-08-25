const express = require("express");
const dotenv = require("dotenv")
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();
const uri = process.env.MONGODB_URI;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// mongodeb
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("drivefleet");
    const carsCollection = db.collection("cars");

    // get all cars
    app.post("/cars", async (req, res) => {
      const carData = req.body;
      console.log(carData);
      const result = await carsCollection.insertOne(carData);
      res.send(result);
    });






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("server is running fine");
});