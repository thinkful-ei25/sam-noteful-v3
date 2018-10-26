'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId : {type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  tags : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

const config = {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, result) => {
    // result.id = doc._id;
    delete result._id;
    delete result.__v;
  }
};

noteSchema.set('toObject', config);
noteSchema.set('toJSON', config);

module.exports = mongoose.model('Note', noteSchema);