const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'));
app.use(fileUpload());

const port = process.env.PORT || 7000;

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hoios.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log('DB::', uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPage").collection("appointments");
  const doctorCollection = client.db("doctorsPage").collection("doctors");
    
  // Post from appointmentForm
  app.post('/addAppointment', (req, res) => {
      const appointment = req.body;
    //   console.log(appointment);
    appointmentCollection.insertOne(appointment)
    .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
  .catch(err => console.error(`Failed to insert item: ${err}`))
  res.send(result)
  })


  // Post from appointmentsByDate
  app.post('/appointmentsByDate', (req, res) => {
      const date = req.body;
      console.log(date.date);
    appointmentCollection.find({date: date.date})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  
  // Get 
  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    }) 
    })

    // File or image upload POST request
    app.post ('/addNewDoctor', (req,res)=>{
      const file = req.files.file;

      const name = req.body.name;
      const email = req.body.email;
      // const filePath = `${__dirname}/doctors/${file.name}`;

      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };

      file.mv(filePath, error=>{
          if(error){
              console.log(error);
              res.status(500).send({msg: 'Failed to upload Image'})
          }
          return res.send({name: file.name, path: `/${file.name}`})
      })

      // const newImg = fs.readFileSync(filePath);
      // const encImg = newImg.toString('base64');

      // var image = {
      //   contentType = file.mimetype,
      //   size: file.size,
      //   img: Buffer(encImg, 'base64'),
      // }
      doctorCollection.insertOne({ name, email, image })
      .then(result => {
            res.send(result > 0);
            // fs.remove(filePath, error => {
            //   if(error) {
            //     console.log(error)
            //     res.status(500).send({msg: 'Failed to upload Image'})
              // }
            // })
          })
      // console.log(name, email, file);
  })
  
    // app.post('/addNewDoctor', (req, res) => {
    //   const file = req.files.file;
    //   const name = req.body.name;
    //   const email = req.body.email;
    //   console.log(name, email, file);

    //   file.mv(`${__dirname}/doctors/${file.name}`, err => {
    //     if(err) {
    //       console.log(err);
    //       return res.status(500).send({msg: 'Failed to upload msg'});
    //     }
    //     doctorCollection.insertOne({name, email, img:file.name})
    //     .then(result => {
    //       res.send(result)
    //     })
    //     // return res.send({name: file.name, path: `/${file.name}`})
    //   })
    // })
  
    app.get('/doctors', (req, res) => {
      doctorCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
    })

});

app.get('/', (req, res) => {
  res.send('Hello Sweden-Bangladesh!')
})

// app.listen(process.env.PORT || 7000)
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})