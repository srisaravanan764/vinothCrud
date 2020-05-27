const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storySchema = new Schema({
  Id:{
    type:Number,
    required:true
  },
  Name:{
    type:String,
    required:false
  },
  Domain:{
    type:String,
    required:false
  },
  Phone:{
    type:String,
    required:false
  },
  Status:{
    type:Boolean,
    required:false,
    default:false
  },
  Street:{
    type:String,
    required:false,
    default:false
  },
  State:{
    type:String,
    required:false,
    default:false
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  updated_at: {
    type: Date,
    default: new Date()
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
});

storySchema.index({});
const storyModel = mongoose.model("stories", storySchema);
module.exports = storyModel;
