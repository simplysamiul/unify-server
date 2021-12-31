const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
require ("dotenv").config();
const fileUpload = require("express-fileupload");


// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Connect Databae with Server
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j00en.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run(){
    try{
        await client.connect();
        const database = client.db("store");
        const userCollection = database.collection("users");


        // Get All USer Info
        app.get("/users", async(req,res)=>{
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            console.log(users);
            res.send(users);
        });
        // Get Specific user by the email
        app.get("/users/:email", async(req,res)=>{
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send(user);
        });
        // Update Spcific user data
        app.put("/users", async(req,res)=>{
            const displayName = req.body.displayName;
            const email = req.body.email;
            const address = req.body.address;
            const profileImage = req.files.profileImg;
            const profileData = profileImage.data;
            const profileEncode = profileData.toString("base64");
            const profileBuffer = Buffer.from(profileEncode, "base64");
            const bannerImage = req.files.bannerImg;
            const bannerData = bannerImage.data;
            const bannerEncode = bannerData.toString("base64");
            const bannerBuffer = Buffer.from(bannerEncode, "base64");
            const user = {
                displayName,
                address,
                profileImg : profileBuffer,
                bannerImg : bannerBuffer
            };
            const filter = { email };
            const options = { upsert: true };
            const updateDoc = {$set : user};
            const result = await userCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })

        // Post user Info
        app.post("/users", async(req,res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
    }
    finally {
        // await client.close();
      }
}
run().catch(console.dir);






// Root route
app.get("/", (req,res)=>{
    res.send("Server Started ?")
});

// Connect Port
app.listen(port, (req,res)=>{
    console.log(`Port listing at ${port}`);
})