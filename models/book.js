"use strict";

const mongoose = require("mongoose");

const mongoUri = process.env.DB;

mongoose.connect(mongoUri);

const bookSchema = new mongoose.Schema({
  title: {type: String, required: true, index: true},
  comments: {type: [String], default: []}
},
{
  virtuals: {
    commentcount: {
      get() {
        return this.comments.length;
      }
    }
  },
  id: false,
  toJSON: {
    versionKey: false,
    virtuals: true  
  }
});

const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;


