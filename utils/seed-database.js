'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const Folder = require('../models/folders');
const Tag = require('../models/tags');

const { notes, folders, tags } = require('../db/seed/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Tag.insertMany(tags),
      Folder.insertMany(folders),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });