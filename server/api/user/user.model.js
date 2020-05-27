const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  Id:{
    type:String,
    required:true
  },
  StoreId:{
    type:String,
    required:true
  },
  Firstname:{
    type:String,
    required:false
  },
  Lastname:{
    type:String,
    required:false
  },
  Phone:{
    type:String,
    required:false
  },
  Email:{
    type:String,
    required:false
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

userSchema.index({});


const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
