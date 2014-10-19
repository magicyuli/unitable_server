/* Unitable schemas */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemas = {
  'Users': {
    email: { type: String, unique: true, required: true },
    name: { type: String },
    hashedPassword: { type: String, required: true },
    passwordResetToken: { type: String, unique: true },
    resetTokenExpires: { type: Date },
    phone: { type: String },
    address: { type: String },
    gender: { type: Number },
    avatar: { type: String },
    dishes: { type: [Schema.Types.ObjectId] }
  },
  'Posts': {
    date: Date,
    location: { type: String },
    hostId: { type: Schema.Types.ObjectId },
    guestIds: { type: [Schema.Types.ObjectId] },
    dishes: { type: [Schema.Types.ObjectId] }
  },
  'Dishes': {
    discription: { type: String },
    pictures: { type: [Schema.Types.ObjectId] }
  },
  'Pictures': {
    blob: { type: String },
    format: { type: String }
  }
};

for(var sName in schemas) {
  var schema = new Schema(schemas[sName]);
  mongoose.model(sName, schema);
}