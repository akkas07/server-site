const express = require("express");
const dotenv = require("dotenv")
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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


const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "unauthorized access" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Forbidden" });
  }


}



async function run() {
  try {
    // await client.connect();
    const db = client.db("drivefleet");

    const carsCollection = db.collection("cars");


    // booking cars 
    const userBookingCollection = db.collection("userBooking");

    // get all cars
    app.post("/cars", verifyToken, async (req, res) => {
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
    //midile ware 
    app.get("/cars/:id", async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);

    })



    app.post("/userBooking/:userId", async (req, res) => {
      const data = req.body;
      const result = await userBookingCollection.insertOne(data);
      res.json(result);
    });



    app.get("/userBooking/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await userBookingCollection.find({ userId: userId }).toArray();
      res.json(result);
    });


    app.get("/my-added-cars/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await carsCollection.find({ userId: userId }).toArray();
      res.json(result);
    });



    // edit 
    app.patch("/cars/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedcar = req.body;
      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedcar }
      )
      res.json(result);


    });

    // delete 
    app.delete("/cars/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });



    app.get('/search', async (req, res) => {
      try {
        const { search, type } = req.query;
        let queryObj = {};

        if (search) {

          queryObj.$or = [
            { carname: { $regex: search, $options: 'i' } },
            { cartype: { $regex: search, $options: 'i' } }
          ]

        }
        if (type) {
          queryObj.cartype = { $regex: `^${type}$`, $options: 'i' };
        }
        const result = await carsCollection.find(queryObj).toArray();
        res.send(result);
      } catch (error) {
        console.error("Search Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("server is running fine");
});


