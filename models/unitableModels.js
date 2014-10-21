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
        guestEvents: { type: [Schema.Types.ObjectId] },
        dishes: { type: [Schema.Types.ObjectId] }
    },
    'Posts': {
        date: { type: Date, required: true },
        location: { type: String, required: true },
        hostId: { type: Schema.Types.ObjectId, required: true },
        guestIds: { type: [Schema.Types.ObjectId] },
        dishes: { type: [Schema.Types.ObjectId], required: true },
        maxGuestNum: { type: Number, required: true }
    },
    'Dishes': {
        description: { type: String, required: true },
        pictures: { type: [String], required: true }
    }
};

for(var sName in schemas) {
    var schema = new Schema(schemas[sName]);
    mongoose.model(sName, schema);
    exports[sName + 'Model'] = mongoose.model(sName);
}