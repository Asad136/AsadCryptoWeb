const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    photopath: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Use Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema, 'blogs');
