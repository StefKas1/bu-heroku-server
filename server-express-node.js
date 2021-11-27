// MongoDB.
// To use MONGO_DB_CONNECTION (connection string with username and password) in .env file.
require("dotenv/config");
const { MongoClient, ObjectId } = require("mongodb");
try {
  var client = new MongoClient(process.env.MONGO_DB_CONNECTION);
} catch (err) {
  console.log(err);
  // Set in Heroku's 'config vars' (apps >> bu-heroku-server >> settings).
  var client = new MongoClient(process.env.URI);
}

// Express.
const express = require("express");
const app = express();
// Either Heroku sets port or port 3000 is used.
const port = process.env.PORT || 3000;

// Converts every request body to JSON before functions get, post, ... work with data in body.
app.use(express.json());

// Retrieves all objects from MongoDB.
app.get("/", function (req, res) {
  (async () => {
    try {
      // Connects client to (MongoDB Atlas) server.
      await client.connect();
      // Accesses MongoDB.
      const database = client.db("feedback-db");
      const collection = database.collection("feedback-collection");

      // Retrieves all objects from MongoDB.
      const allObjects = await collection.find().toArray();
      allObjects.forEach((object) => console.log(object));
      res.send({ feedback: allObjects });
    } catch (err) {
      console.log(err);
      res.send({ error: "retrieve" });
    } finally {
      // Closes connection when finished or error.
      await client.close();
    }
  })();
});

// Inserts into MongoDB.
app.post("/feedback", function (req, res) {
  (async () => {
    try {
      await client.connect();
      const database = client.db("feedback-db");
      const collection = database.collection("feedback-collection");

      // Inserts into MongoDB.
      const result = await collection.insertOne({
        likes: req.body.likes,
        favorite: req.body.favorite,
      });
      console.log(`Feedback was inserted with _id: ${result.insertedId}`);
      // Response: includes inserted object.
      res.send({
        id: result.insertedId,
        likes: req.body.likes,
        favorite: req.body.favorite,
      });
    } catch (err) {
      console.log(err);
      res.send({ error: "insert" });
    } finally {
      await client.close();
    }
  })();
});

// Deletes in MongoDB by id.
app.delete("/feedback/:id", function (req, res) {
  (async () => {
    try {
      await client.connect();
      const database = client.db("feedback-db");
      const collection = database.collection("feedback-collection");

      // Deletes by id.
      const result = await collection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      console.log("Deleted: ", result);
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ error: "delete" });
    } finally {
      await client.close();
    }
  })();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
