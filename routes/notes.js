'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Note = require('../models/notes');
const Tag = require('../models/tags');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};
  let projection = { title: 1, content: 1, id: 1, folderId: 1, tags: 1 };
  let sort = 'createdAt';

  const filterValue = new RegExp(searchTerm, 'i');

  if (searchTerm) {
    filter.$or = [
      { 'title': { $regex: filterValue } },
      { 'content': { $regex: filterValue } }
    ];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter, projection)
    .sort(sort)
    .populate('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }
  let projection = { title: 1, content: 1, folderId: 1, id: 1, tags: 1 };
  Note.findById(id, projection)
    .populate('tags')
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

  const newItem = {};
  const postFields = ['title', 'content', 'folderId', 'tags'];

  postFields.forEach(field => {
    if (field in req.body) {
      newItem[field] = req.body[field];
    }
  });

  //validate user title
  if (!newItem.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (newItem.folderId) {
    if (!mongoose.Types.ObjectId.isValid(newItem.folderId)) {
      const err = new Error('Invalid folder `ID` entered');
      err.status = 400;
      return next(err);
    }
  }

  if(newItem.folderId === ''){
    delete newItem.folderId;
  }

  if (newItem.tags) {
    for (let i = 0; i < newItem.tags.length; i++) {
      if (!mongoose.Types.ObjectId.isValid(newItem.tags[i])) {
        const err = new Error('Invalid tag `ID` entered');
        err.status = 400;
        return next(err);
      }
    }
  }


  

  Note.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateItem = {};
  const updatableFields = ['title', 'content', 'folderId', 'tags'];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updateItem[field] = req.body[field];
    }
  });

  //validate user input for title
  if (updateItem.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }


  if (updateItem.tags) {
    for (let i = 0; i < updateItem.tags.length; i++) {
      if (!mongoose.Types.ObjectId.isValid(updateItem.tags[i])) {
        const err = new Error('Invalid tag `ID` entered');
        err.status = 400;
        return next(err);
      }
    }
  }

  if (updateItem.folderId) {
    if (!mongoose.Types.ObjectId.isValid(updateItem.folderId)) {
      const err = new Error('Invalid folder `ID` entered');
      err.status = 400;
      return next(err);
    }
  }

  if(updateItem.folderId === ''){
    delete updateItem.folderId;
    updateItem.$unset = {folderId: 1};
  }

  //need to validate id somehow
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }


  const updateNew = { new: true };
  Note.findByIdAndUpdate(id, updateItem, updateNew)
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;