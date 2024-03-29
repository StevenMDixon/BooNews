const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  data: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  pin: {
    type: Number,
    required: true
  }
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
