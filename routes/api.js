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

const handleNoBook = (res) => {
  res.status(200) // Properly: 404
     .send("no book exists");
};

const handleInvalidId = (res) => {
  res.status(400)
     .json({error: "An error occurred while processing your request: the book identifier must be a 24-character hexadecimal string."});
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
        
         if (title) {
             
           const newBook = await BookModel.create({title});

           //response will contain new book object including at least _id and title           
           const resBook = newBook.toJSON({
             transform(doc, ret) {
               delete ret.comments;
               delete ret.commentcount;
               return ret;
             }
           });

           res.status(201)
              .json(resBook); 
             
         } else {
             
           res.status(200) // Properly: 422
              .send("missing required field title");
             
         };
           
       } catch (err) {
           
         handleServerErr(err, res);

       };       

     })    

     .get(async function (req, res) {
       
       try {
           
         const foundBooks = await BookModel.find({}, null, {sort: "title"});
         
         //response will be array of book objects
         //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
         const resBooks = foundBooks.map((elem) => {        
           return elem.toJSON({
             transform(doc, ret) {
               delete ret.comments;
               return ret;
             }
           });
         });

         res.status(200)
            .json(resBooks);
           
       } catch (err) {
           
         handleServerErr(err, res);

       };       

     })

     .delete(async function (req, res) {
       
			 try {

				 await BookModel.deleteMany();

         //if successful response will be 'complete delete successful'
				 res.status(200)
				    .send("complete delete successful");

			 } catch (err) {

         handleServerErr(err, res);

			 };       

     });

  app.route('/api/books/:id')

     .post(async function (req, res) {

			 try {
       
         const _id = req.params.id;
         const comment = req.body.comment;       
        
         if (mongoose.isValidObjectId(_id)) {

          const bookToUpdate = await BookModel.findById(_id);

          if (bookToUpdate) {

            if (comment) {
              
              const updatedBook = await BookModel.findByIdAndUpdate(_id, {$push: {comments: comment}}, {new: true});

              //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
              const resBook = updatedBook.toJSON({
                transform(doc, ret) {
                  delete ret.commentcount;
                  return ret;
                }
              });

              res.status(200)
                 .json(resBook);

            } else {

              res.status(200) // Properly: 422
                 .send("missing required field comment");

            };
            
          } else {

            handleNoBook(res);
            
          }; 

				 } else {

           handleInvalidId(res);
				   
				 };

       } catch (err) {

         handleServerErr(err, res);

       };        
       
     })

     .get(async function (req, res) {

       try {
       
         const _id = req.params.id;       
         
         if (mongoose.isValidObjectId(_id)) {
           
           const foundBook = await BookModel.findById(_id);           

           if (foundBook) {

             //json res format same as .post
             const resBook = foundBook.toJSON({
               transform(doc, ret) {
                 delete ret.commentcount;
                 return ret;
               }
             });

             res.status(200)
                .json(resBook);
            
           } else {

             handleNoBook(res);
            
           };

         } else {

           handleInvalidId(res);

         };

       } catch (err) { 
         
         handleServerErr(err, res);

       };        
   
     })
       
     .delete(async function (req, res) {

       try {
       
         const _id = req.params.id;       
         
         if (mongoose.isValidObjectId(_id)) {

           const deletedBook = await BookModel.findByIdAndDelete(_id);

           if (deletedBook) {

             //if successful response will be 'delete successful'
             res.status(200)
                .send("delete successful");

           } else {

             handleNoBook(res); 

           };
         
         } else {

           handleInvalidId(res); 

         };

       } catch (err) {

         handleServerErr(err, res);

       };            
       
     });

};

