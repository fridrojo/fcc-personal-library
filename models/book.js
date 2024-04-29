"use strict";

const mongoose = require("mongoose");

const mongoUri = process.env.DB;

mongoose.connect(mongoUri);

const bookSchema = new mongoose.Schema({
  title: {type: String, required: true, index: true},
  comments: {type: [String], default: []},
  commentcount: {type: Number, default: 0}
});

const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;


