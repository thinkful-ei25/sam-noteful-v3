'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name : {type: String, required: true, unique: true}
});

folderSchema.set('timestamps', true);

const config = {
  virtuals: true,
  transform: (doc,result)=>{
    delete result._id;
    delete result.__v;
  }
};

folderSchema.set('toObject', config);
folderSchema.set('toJSON', config);

module.exports = mongoose.model('Folder', folderSchema);