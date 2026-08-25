const express = require("express");
const dotenv = require("dotenv")
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


    // booking cars 
    const userBookingCollection = db.collection("userBooking");

    // get all cars
    app.post("/cars", async (req, res) => {
      const carData = req.body;
      console.log(carData);
      const result = await carsCollection.insertOne(carData);
      res.send(result);
    });


    app.get("/cars", async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.send(result);
    });



    // get datails page single car  
    app.get("/cars/:id", async (req, res) => {
      const {id} = req.params;
      const result = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);

    })



    app.post("/userBooking/:userId", async (req, res) => {
      const data = req.body;
      const result = await userBookingCollection.insertOne(data);
      res.json(result);
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