'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/notes');

//find/search for notes using Note.find

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'duis';
    let filter = {};

    const filterValue = new RegExp(searchTerm,'i');

    if (searchTerm) { 
      filter = {$or : [
        {title : filterValue},
        {content : filterValue}
      ]};
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//find note by id using Note.findById


// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000003';

//     return Note.findById(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


//create a new note using Note.create

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {

//     return Note.create({
//       title: 'test note',
//       content: 'test content adsf;asdf;jk'
//     });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//update a note by id using Note.findByIdAndUpdate


// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000003';
//     const toUpdate = {
//       title : 'updated note title',
//       content : 'hey look i updated the content too'
//     };

//     return Note.findByIdAndUpdate(id,{$set : toUpdate});
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//Delete a note by using Note.findByIdAndRemove

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000003';

//     return Note.findByIdAndRemove(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });