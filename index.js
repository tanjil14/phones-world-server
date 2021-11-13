const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());
//connection string
"";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.flc1e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('PhonesDB');
        const serviceCollection = database.collection('phones');
        const myOrderCollection = database.collection('userOrders');
        const reviewCollection = database.collection('userReviews');
        const usersCollection = database.collection('users');
        console.log('database connected');
        // getting from database
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({})
            const services = await cursor.toArray();
            res.send(services)
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service)
        })
        // Load data according to user id get api
        app.get('/cart/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await myOrderCollection.find(query).toArray();
            res.json(result);
        })
        //get all orders
        app.get('/orders', async (req, res) => {
            const cursor = myOrderCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        })
        //confirm order by admin
        app.put('/orders', async (req, res) => {
            const order = req.body;
            const filter = { _id: ObjectId(order._id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `shipping`
                },
            };
            const result = await myOrderCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        })


        // add data to cart collection with additional info
        app.post('/booking/add', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await myOrderCollection.insertOne(booking)
            res.json(result)
        })
        // Post
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result)
            console.log(result);
        });
        //add user
        app.post('/users', async (req, res) => {
            const service = req.body;
            const result = await usersCollection.insertOne(service);
            res.json(result)
            console.log(result);
        });
        //update user
        app.put('/users', async (req, res) => {
            const email = req.body;
            // console.log(email);
            const filter = { email: email.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    email: email.email,
                    role: `admin`
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            console.log(result);
            res.send(result);
        });
        // find user 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        // add review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
            console.log(result);
        });
        // get review 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({})
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // delete one item
        app.delete('/booking/add/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myOrderCollection.deleteOne(query);
            res.json(result);
            console.log(result);
        });
        //delete one from products list
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.json(result);
            console.log(result);
        });
    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('phone server is running');
})

app.listen(port, () => {
    console.log("server is running", port);
})