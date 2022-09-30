//import express
const express = require('express');

// import mongoose
const mongoose = require('mongoose');
//import model user
const User = require('./models/user');
//import model plat
const Plat = require('./models/plat')
//import body parser 
const bodyParser = require('body-parser');
const user = require('./models/user');
//import bcrypt 
const bcrypt = require('bcrypt');
//import pdfKit
//fs file sys module (node-modules)
const fs=require('fs');
//import file pdfkit.js
const PDFDocument = require('./pdfkit');

//create express app
const app = express();
// Configuration
// Send JSON responses
app.use(bodyParser.json());
// Parse Request Objects
app.use(bodyParser.urlencoded({ extended: true }));
// Security configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-with, Authorization, expiresIn"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS, PATCH, PUT"
  );
  next();
});
//Connect to database
mongoose.connect('mongodb://localhost:27017/meanjuin22', { useNewUrlParser: true, useUnifiedTopology: true });
//login
app.post("/login", (req, res) => {
  console.log("Here in login", req.body);
  User.findOne({ email: req.body.email }).then(
    (resultEmail) => {
      console.log("resultEmail", resultEmail);
      if (!resultEmail) {
        res.status(200).json({
          message: "Wrong Email"
        });
      }
      return bcrypt.compare(req.body.password, resultEmail.password);
    })
    .then(
      (resultPwd) => {
        console.log("resultPwd", resultPwd);
        if (!resultPwd) {
          res.status(200).json({
            findedUser: "Wrong password"
          });
        }
        else {
          User.findOne({ email: req.body.email }).then(
            (result) => {
              console.log("result", result);
              let userTosend = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                role: result.role
              }
              res.status(200).json({
                message: "success!",
                connectedUser: userTosend
              })
            }
          )
        }
      })
});


//business login  : add user
app.post("/users", (req, res) => {
  console.log("HERE IN ADD USER");

  User.findOne({ email: req.body.email }).then(
    (result) => {

      if (result) {
        res.status(200).json({ message: "USER ALREADY EXISTS" })
      } else {
        bcrypt.hash(req.body.password, 10).then(cryptedPassword => {
          let user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: cryptedPassword,
            tel: req.body.tel,
            role: req.body.role,
            speciality: req.body.speciality,
            experience: req.body.experience,
            dateOfBirth: req.body.dateOfBirth
          })

          //save 
          user.save();
          //response
          res.status(200).json({ message: "USER ADDED WITH SUCCESS" })
        })
      }
    })


})

//business logic : Get all users
app.get("/users", (req, res) => {
  console.log("here in get all users");
  User.find((err, docs) => {
    if (err) {
      console.log("error in DB");

    }
    else {
      res.status(200).json({
        users: docs
      })
    }
  })
})
//business logic : get user by id
app.get("/users/:id", (req, res) => {
  console.log("here in get user by id ");
  let userId = req.params.id
  User.findOne({ _id: userId }).then(
    (doc) => {
      if (!doc) {
        console.log("ERROR");

      }
      else {
        res.status(200).json({
          user: doc
        })
      }
    }
  )
})
//bussiness  logic : update user
app.put("/users/:id", (req, res) => {
  console.log("here in update user");
  bcrypt.hash(req.body.password, 10).then(cryptedPassword => {
    //collect data 
    let user = {
      _id: req.body._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: cryptedPassword,
      tel: req.body.tel,
      role: req.body.role

    }
    User.updateOne({ _id: req.body._id }, user).then(
      (result) => {
        if (result) {
          console.log(result);
          res.status(200).json({
            message: " user updated"
          })
        }
      }
    )
  })

})
//get users by role 
app.get("/getUsers/:role", (req, res) => {
  console.log("here in get user by role ");
  let userRole = req.params.role
  User.find({ role: userRole }).then(
    (docs) => {
      if (!docs) {
        console.log("ERROR");

      }
      else {
        res.status(200).json({
          users: docs
        })
      }
    }
  )
})
//delete user
app.delete("/users/:id", (req, res) => {


  let iduser = req.params.id;
  Plat.deleteMany({ idChef: req.params.id }).then(
    (result) => {
      console.log(result);
      if (result) {

        console.log(" plats removed");
      }

    }



  )
  User.deleteOne({ _id: iduser }).then(
    (result) => {
      console.log(result);
      if (result) {
        res.status(200).json({
          message: " user removed"
        })
      }
    }

  )
})
//generate pdf
app.get("/generatePDF", (req, res) => {
  User.find((err, docs) => {
  if (err) {
  console.log("ERROR");
  } else {
  // Create The PDF document
  const doc = new PDFDocument();
  // Pipe the PDF into a user's file
  doc.pipe(fs.createWriteStream(`backend/pdfs/test.pdf`));
  // Add the header -
  //https://pspdfkit.com/blog/2019/generate-invoices pdfkit-node/
  doc
  .image("backend/images/logo.png", 50, 45, { width: 50 })
  .fillColor("#444444")
  .fontSize(20)
  .text("Here All Users", 110, 57)
  .fontSize(10)
  .text("Imm Yasmine Tower", 200, 65, { align: "right" })
  .text("Centre Urbain Nord", 200, 80, { align: "right" }) .moveDown();
  // Create the table -
 // https://www.andronio.me/2017/09/02/pdfkit-tables/
  const table = {
  headers: [
  "FirstName",
  "LastName",
  "Email Address",
  "Phone",
  ],
  rows: [],
  };
  // Add the users to the table
  for (const user of docs) {
  table.rows.push([
  user.firstName,
  user.lastName,
  user.email,
  user.tel,
  ]);
  }
  // Draw the table
  doc.moveDown().table(table, 10, 125, { width: 590 }); // Finalize the PDF and end the stream
  doc.end();
  res.status(200).json({
  message: "HERE PDF (success)",
  });
  }
  });
  });
  

//add plat
app.post("/plats", (req, res) => {
  console.log("here in add plats");

  Plat.findOne({ platName: req.body.platName, idChef: req.body.idChef }).then(
    (doc) => {
      if (!doc) {
        console.log("ce plat n'existe pas");
        let plat = new Plat({
          platName: req.body.platName,
          price: req.body.price,
          description: req.body.description,
          idChef: req.body.idChef

        });
        //save 
        plat.save();
        //send response 
        res.status(200).json({
          message: "Plat added with success"
        })



      }
      else {
        res.status(200).json({
          message: " plat deja existe"
        })
      }
    }
  )





})
//get plats by idchef
app.get("/getPlats/:idChef", (req, res) => {
  console.log("here in get plats");
  let idchef = req.params.idchef

  Plat.find({ idChef: idchef }).then(
    (docs) => {
      if (!docs) {
        console.log("ERROR");

      }
      else {
        res.status(200).json({
          plats: docs
        })
      }
    }
  )
})
//get all plats
app.get("/plats", (req, res) => {
  console.log("get all plats here");
  Plat.find((err, docs) => {
    if (err) {
      console.log("error in db ");
    }
    else {
      res.status(200).json({
        plats: docs
      })
    }
  })
})
//Update plat
app.put("/plats/:id", (req, res) => {
  console.log("here in update plat");
  //collect data 
  let plat = {
    _id: req.body._id,
    platName: req.body.platName,
    price: req.body.price,
    idChef: req.body.idChef,
    description: req.body.description,


  }
  Plat.updateOne({ _id: req.body._id }, plat).then(
    (result) => {
      console.log(result);
      if (result) {
        res.status(200).json({
          message: " plat updated"
        })
      }
    }
  )
})
// remove plat
app.delete("/plats/:_id", (req, res) => {
  console.log("plat deleted");
  let _id = req.body._id;
  Plat.deleteOne({ _id: req.body._id }).then(

    (result) => {
      console.log(result);
      if (result) {
        res.status(200).json({
          message: " plat removed"
        })
      }
    }

  )


})
//export app 
module.exports = app;