/*
*
*
*       Complete the API routing below
*       
*       
*/

"use strict";

const mongoose = require("mongoose");
const BookModel = require("../models/book.js");

const handleWrongId = (res) => {
  res.status(400)
     .json({error: "An error occurred while processing your request: the book identifier must be a 24-character hexadecimal string."});
};
const handleNoBook = (res) => {
  res.status(404)
     .send("no book exists");
};
const handleServerErr = (err, res) => {
  res.status(500)
     .json({error: `An error occurred while processing your request (${err}).`});
};

module.exports = function (app) {

  app.route('/api/books')

     .post(async function (req, res) {

			 try {

         const title = req.body.title;

         //response will contain new book object including at least _id and title
         if (title) {
             
           const newBook = await BookModel.create({title});
           const resBook = {
             _id: newBook._id, 
             title: newBook.title
           };
           res.status(201)
              .json(resBook); 
             
         } else {
             
           res.status(422)
              .send("missing required field title");
             
         };
           
       } catch (err) {
           
         handleServerErr(err, res);

       };       

     })    

     .get(async function (req, res) {

       //response will be array of book objects
       //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
       try {
           
         const foundBooks = await BookModel.find({}, "-comments -__v", {sort: "title"});
         res.status(200)
            .json(foundBooks);
           
       } catch (err) {
           
         handleServerErr(err, res);

       };       

     })

     .delete(async function (req, res) {

       //if successful response will be 'complete delete successful'
			 try {

				await BookModel.deleteMany();

				res.status(200)
				   .send("complete delete successful");

			 } catch (err) {

         handleServerErr(err, res);

			 };       

     });

  app.route('/api/books/:_id')

     .post(async function (req, res) {

			 try {
       
         const _id = req.params._id;
         const comment = req.body.comment;
       
         //json res format same as .get
         if (mongoose.isValidObjectId(_id)) {

          const bookToUpdate = await BookModel.findById(_id);

          if (bookToUpdate) {

            if (comment) {

              const updatedBook = await BookModel.findByIdAndUpdate(_id, {$push: {comments: comment}}, {new: true, select: "-commentcount -__v"});

              res.status(200)
                 .json(updatedBook);

            } else {

              res.status(422)
                 .send("missing required field comment");

            };
            
          } else {

            handleNoBook(res);
            
          }; 

				 } else {

           handleWrongId(res);
				   
				 };

       } catch (err) {

         handleServerErr(err, res);

       };        
       
     })

     .get(async function (req, res) {

       try {
       
         const _id = req.params._id;
       
         //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
         if (mongoose.isValidObjectId(_id)) {

           const foundBook = await BookModel.findById(_id, "-commentcount -__v");

           if (foundBook) {

             res.status(200)
                .json(foundBook);
            
           } else {

             handleNoBook(res);
            
           };

         } else {

           handleWrongId(res);

         };

       } catch (err) { 
         
         handleServerErr(err, res);

       };        
   
     })
       
     .delete(async function (req, res) {

       try {
       
         const _id = req.params._id;
       
         //if successful response will be 'delete successful'
         if (mongoose.isValidObjectId(_id)) {

           const deletedBook = await BookModel.findByIdAndDelete(_id);

           if (deletedBook) {

             res.status(200)
                .send("delete successful");

           } else {

             handleNoBook(res); 

           };
         
         } else {

           handleWrongId(res); 

         };

       } catch (err) {

         handleServerErr(err, res);

       };            
       
     });

};
