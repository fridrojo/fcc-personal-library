"use strict";

const mongoose = require("mongoose");

const mongoUri = process.env.DB;

mongoose.connect(mongoUri);

const bookSchema = new mongoose.Schema({
  title: {type: String, required: true, index: true},
  comments: {type: [String], default: []},
  commentcount: {type: Number, default: 0}
}/*,
{
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
}*/);
/*
bookSchema.post("save", function (doc) {
  doc.schema.set("toJSON", {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret.comments;
      delete ret.commentcount;
      return ret;
    }
  });
});
bookSchema.post("find", function (docs) {
  docs[0].schema.set("toJSON", {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret.comments;      
      return ret;
    }
  });
});
*/
const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;


