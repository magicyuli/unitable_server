/* Unitable schemas */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemas = {
    'Users': {
        email: { type: String, unique: true, required: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        passwordResetToken: { type: String },
        resetTokenExpires: { type: Date },
        phone: { type: String },
        address: { type: String },
        gender: { type: Number, required: true },
        avatar: { type: String },
        dishes: { type: [{ type: Schema.Types.ObjectId, ref: 'Dishes' }] }
    },
    'Posts': {
        date: { type: Date, required: true },
        location: { type: String, required: true },
        host: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
        guests: { type: [{ type: Schema.Types.ObjectId, ref: 'Users' }] },
        dishes: { type: [{ type: Schema.Types.ObjectId, ref: 'Dishes' }], required: true },
        price: { type: Number },
        maxGuestNum: { type: Number, required: true }
    },
    'Dishes': {
        name: { type: String, required: true },
        description: { type: String, required: true },
        pictures: { type: [String], required: true },
        host: { type: Schema.Types.ObjectId }
    }
};

for(var sName in schemas) {
    var schema = new Schema(schemas[sName]);
    mongoose.model(sName, schema);
    exports[sName + 'Model'] = mongoose.model(sName);
}