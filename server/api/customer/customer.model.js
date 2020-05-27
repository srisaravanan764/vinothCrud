"use strict";

var mongoose = require("mongoose");
var crypto = require("crypto");
var Schema = mongoose.Schema;

// CustomerSchema Schema
var CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    default: "4CIu3vw0tyWlDn2b" // Api ref key
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  tokens: [
    {
      appClient: {
        type: String,
        required: true
      },
      refreshToken: {
        type: String,
        required: true
      },
      lastAccess: {
        type: Date,
        required: false
      }
    }
  ],
  deleted: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    default: "User"
  }
});

CustomerSchema.index({});

/**
 * Virtuals
 */
CustomerSchema.virtual("password")
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    //console.log("user: ", this);
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

var validatePresenceOf = function(value) {
  return value && value.length;
};

// Validate empty username
CustomerSchema.path("email").validate(function(email) {
  return email.length;
}, "Email cannot be blank");

// Validate empty password
CustomerSchema.path("hashedPassword").validate(function(hashedPassword) {
  console.log("Hashed pwd:", hashedPassword);
  return hashedPassword.length;
}, "Password cannot be blank");

/**
 * Methods
 */
CustomerSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String}
   *            plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    console.log(
      this.hashedPassword,
      "customer encryptPassword",
      this.encryptPassword(plainText)
    );
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString("base64");
  },

  /**
   * Encrypt password
   *
   * @param {String}
   *            password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return "";
    var saltWithEmail = new Buffer(
      this.salt + this.email.toString("base64"),
      "base64"
    );
    return crypto
      .pbkdf2Sync(password, saltWithEmail, 10000, 64, null)
      .toString("base64");
  }
};

var CustomerModel = mongoose.model("customer", CustomerSchema);
module.exports = CustomerModel;
