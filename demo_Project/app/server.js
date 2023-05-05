let express = require('express');
let path = require('path');
let fs = require('fs');
const {MongoClient} = require('mongodb');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/Output.png"));
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true};

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";




app.post('/update-profile', async function (req, res) {
  let userObj = req.body;
  // console.log("Update profile endpoint");

  const client = new MongoClient(mongoUrlLocal, mongoClientOptions)
  try {
    await client.connect();
    const db= client.db("user-account");
    // if (db) console.log("Connected successfully to server");
    userObj['userid'] = 1;

    let myQuery = { userid: 1 };
    let newValues = { $set: userObj };

    const result=await db.collection('users').updateOne(myQuery, newValues, { upsert: true })

    
    res.send(userObj);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error updating profile');
  }
  finally {
     await client.close();
  }
});

app.get('/get-profile', async function (req, res) {
  const client = new MongoClient(mongoUrlLocal, mongoClientOptions)

  try 
  {
    await client.connect();
    const db= client.db("user-account");
    let myQuery = { userid: 1 };
    const response=await db.collection('users').findOne(myQuery)
    res.send(response );

  } catch (error) {

    console.log(error);
    res.status(500).send('Error updating profile');
  }
  finally{
    await client.close();
  }
});

app.listen(3000, function () {
  console.log("app listening on port 3000");
});
