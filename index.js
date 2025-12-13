const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_KEY);
const app = express()
const port = process.env.PORT || 3000

const generateTrackingId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${timestamp}-${randomNumber}`;
};

app.use(express.json())
app.use(cors())

const admin = require("firebase-admin");

// const serviceAccount = require("./ass-eleven-library-admin-sdk.json");
// const serviceAccount = require("./firebase-admin-key.json");

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8')
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const verifyFBToken = async (req, res, next) => {
  // console.log("req.headers.authorization", req.headers.authorization)
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  try {
    const idToken = token.split(' ')[1]
    const decoded = await admin.auth().verifyIdToken(idToken)
    // console.log("decoded in the ", decoded)
    req.decoded_email = decoded.email
    next()

  }
  catch (err) {
    return res.status(401).send({ message: 'unauthorized access' })

  }
}


const uri = `mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASS}@aftabcluster.sr9zcvj.mongodb.net/?appName=aftabcluster`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const libraryDB = client.db('libraryDB')
    const usersCollection = libraryDB.collection('users')
    const booksCollection = libraryDB.collection('books')
    const ordersCollection = libraryDB.collection('orders')
    const paymentsCollection = libraryDB.collection('payments')
    const wishlistCollection = libraryDB.collection('wishlist')
    const ratingsCollection = libraryDB.collection('ratings')
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    await paymentsCollection.createIndex({ sessionId: 1 }, { unique: true });

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded_email
      const query = { email }
      const user = await usersCollection.findOne(query)
      if (!user || user.role !== "Admin") {
        return res.status(403).send({ message: "forbidden access" })
      }
      next()
    }

    //USER AUTHENTIC
    app.post('/users', async (req, res) => {
      const newUser = req.body
      const result = await usersCollection.insertOne(newUser)
      res.send(result)
    })
    //allusers
    app.get('/users', verifyFBToken, async (req, res) => {
      const cursor = usersCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    //single user

    app.get('/users/by-email', async (req, res) => {
      const cursor = usersCollection.find({ email: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/users/readers', verifyFBToken, async (req, res) => {
      const cursor = usersCollection.find({ role: "Reader" })
      const result = await cursor.toArray()
      res.send(result)
    })
    app.patch('/users/normal/:id', verifyFBToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await usersCollection.updateOne(query, update, option)
      res.send(result)
    })
    app.patch('/users/admin/:id', verifyFBToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await usersCollection.updateOne(query, update, option)
      res.send(result)
    })

    app.patch('/users/by-email-patch/:email', verifyFBToken, async (req, res) => {
      const query = { email: req.params.email }
      const newData = req.body
      const update = {
        $set: newData
      }

      const result = await usersCollection.updateOne(query, update)
      res.send(result)
    })
    //books
    app.post('/books', verifyFBToken, async (req, res) => {
      const newBook = req.body
      const result = await booksCollection.insertOne(newBook)
      res.send(result)
    })
    app.get('/books', async (req, res) => {
      //  console.log("req.headers",req?.headers?.authorization)
      const cursor = booksCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/books/recent', async (req, res) => {
      const cursor = booksCollection.find({ situation: "Published" }).sort({ time: -1 }).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/books/search', async (req, res) => {
      const searchtext = req.query.searchtext
      const result = await booksCollection.find({
        title: { $regex: searchtext, $options: "i" }
      }).toArray()
      res.send(result)
    })
    app.get('/books/librarian', verifyFBToken, async (req, res) => {
      if (req.query.email !== req.decoded_email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const cursor = booksCollection.find({ librarianEmail: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/books/:id', verifyFBToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.findOne(query)
      res.send(result)
    })
    app.delete('/books/:id', verifyFBToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.deleteOne(query)
      res.send(result)
    })
    app.patch('/books/librarian/:id', verifyFBToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await booksCollection.updateOne(query, update, option)
      res.send(result)
    })
    app.patch('/books-all/admin/:id', verifyFBToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await booksCollection.updateOne(query, update, option)
      res.send(result)
    })





    //orders can be matched
    app.get('/orders/delivery-status/stats', verifyFBToken, async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: "$deliveryStatus",
            count: { $sum: 1 }
          }
        }
      ]
      const result = await ordersCollection.aggregate(pipeline).toArray()
      res.send(result)
    })
    app.get('/users/total-count/stats', verifyFBToken, async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]
      const result = await usersCollection.aggregate(pipeline).toArray()
      res.send(result)
    })


    app.get('/orders/librarian-email/:email/stats', verifyFBToken, async (req, res) => {
      const { email } = req.params;

      const pipeline = [
        {
          $match: { librarianEmail: email }  // নির্দিষ্ট email এর অর্ডার
        },
        {
          $facet: {
            deliveryStatus: [
              { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }
            ],
            paymentStatus: [
              { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
            ]
          }
        }
      ];

      const result = await ordersCollection.aggregate(pipeline).toArray();
      res.send(result[0]);
    });
    app.get('/orders/reader-email/:email/stats', verifyFBToken, async (req, res) => {
      const { email } = req.params;

      const pipeline = [
        {
          $match: { readerEmail: email }  // fixed thing
        },
        {
          $facet: {
            deliveryStatus: [
              { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }
            ],
            paymentStatus: [
              { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
            ]
          }
        }
      ];

      const result = await ordersCollection.aggregate(pipeline).toArray();
      res.send(result[0]);
    });


    app.post('/orders', verifyFBToken, async (req, res) => {
      const newOrder = req.body
      const result = await ordersCollection.insertOne(newOrder)
      res.send(result)
    })
    app.get('/orders', verifyFBToken, async (req, res) => {
      const cursor = ordersCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.delete('/orders/:id', verifyFBToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await ordersCollection.deleteOne(query)
      res.send(result)
    })
    //user order
    app.get('/orders/of-user', verifyFBToken, async (req, res) => {
      const cursor = ordersCollection.find({ readerEmail: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/orders/of-librarian', verifyFBToken, async (req, res) => {
      const cursor = ordersCollection.find({ librarianEmail: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })

    app.patch('/orders/:id', verifyFBToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await ordersCollection.updateOne(query, update, option)
      res.send(result)
    })


    // ratings
    app.post('/ratings', verifyFBToken, async (req, res) => {
      const newRating = req.body
      const result = await ratingsCollection.insertOne(newRating)
      res.send(result)
    })
    app.get('/ratings/book-id', verifyFBToken, async (req, res) => {
      const cursor = ratingsCollection.find({ bookId: req.query.id })
      const result = await cursor.toArray()
      res.send(result)
    })

    //wishlist

    app.post('/wishlist', verifyFBToken, async (req, res) => {
      const newBook = req.body
      const result = await wishlistCollection.insertOne(newBook)
      res.send(result)
    })

    app.get('/wishlist/by-email', verifyFBToken, async (req, res) => {
      const cursor = wishlistCollection.find({ readerEmail: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })
    //payment 

    app.get('/payments/by-email', verifyFBToken, async (req, res) => {
      const cursor = paymentsCollection.find({ readerEmail: req.query.email })
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/create-checkout-session', verifyFBToken, async (req, res) => {
      const paymentInfo = req.body
      const amount = paymentInfo.price * 100
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, price_1234) of the product you want to sell
            price_data: {
              currency: 'USD',
              unit_amount: amount,
              product_data: {
                name: paymentInfo.bookName,
              }
            },
            quantity: 1,
          },
        ],
        customer_email: paymentInfo.readerEmail,
        metadata: {
          parcelId: paymentInfo.parcelId,
          bookName: paymentInfo.bookName
        },
        mode: 'payment',
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
      });

      res.send({ url: session.url });
    });


    app.patch('/payment-success', async (req, res) => {
      const sessionId = req.query.session_id
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status === "paid") {
        const id = session.metadata.parcelId
        const query = { _id: new ObjectId(id) }
        const update = {
          $set: {
            paymentStatus: "paid",
            deliveryStatus: "pending",
            trackingId: generateTrackingId()
          }
        }
        const result = await ordersCollection.updateOne(query, update)

        const payment = {
          sessionId: sessionId,
          amount: session.amount_total / 100,
          currency: session.currency,
          readerEmail: session.customer_email,
          parcelId: session.metadata.parcelId,
          parcelName: session.metadata.bookName,
          date: new Date().toISOString().split('T')[0],
          paymentId: session.payment_intent,
          paymentStatus: session.payment_status,
        }

        const isExist = await paymentsCollection.findOne({ sessionId: sessionId });
        if (!isExist) {
          const resultPayment = await paymentsCollection.insertOne(payment)
          res.send({ success: true, modifyParcel: result, paymentInfo: resultPayment })
        }
      }
      return res.send({ success: false })
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example if app is the main listening on port ${port}`)
})
