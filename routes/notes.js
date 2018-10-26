'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Note = require('../models/notes');
const Tag = require('../models/tags');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const {searchTerm, folderId, tagId} = req.query;

  let filter={};
  let projection = {title: 1, content:1, id:1, folderId: 1, tags: 1};
  let sort = 'createdAt';

  const filterValue = new RegExp(searchTerm,'i');

  if(searchTerm){
    filter.$or = [
      {'title' : {$regex : filterValue}},
      {'content' : {$regex : filterValue}}
    ];
  }

  if(folderId){
    filter.folderId = folderId;
  }

  if(tagId){
    filter.tags = tagId;
  }

  Note.find(filter,projection)
    .sort(sort)
    .populate('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err=>{
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }
  let projection = {title: 1, content: 1, folderId: 1, id:1, tags: 1};
  Note.findById(id,projection)
    .populate('tags')
    .then(results => {
      if(results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err=>next(err));

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {title, content, folderId, tags} = req.body;
  
  //validate user title
  if(!title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  for(let i=0; i<tags.length; i++){
    if(!mongoose.Types.ObjectId.isValid(tags[i].id)){
      const err = new Error('Invalid `ID` entered');
      err.status = 400;
      return next(err);
    }
  }


  const newItem = {title, content, folderId, tags};

  Note.create(newItem)
    .then(result=>{
      let returned = {title: result.title, content: result.content, id: result.id, folderId: result.folderId};
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(returned);
    })
    .catch(err=>next(err));

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content, folderId, tags} = req.body;


  //validate user input for title
  if(!title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title , content, folderId, tags
  };

  for(let i=0; i<tags.length; i++){
    if(!mongoose.Types.ObjectId.isValid(tags[i].id)){
      const err = new Error('Invalid `ID` entered');
      err.status = 400;
      return next(err);
    }
  }

  const updateNew = {new: true};

  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  //need to validate id somehow
  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndUpdate(id,updateItem, updateNew)
    .populate('tags')
    .then(result=>{
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err=>{
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(()=>{
      res.status(204).end();
    })
    .catch(err=>{
      next(err);
    });
});

module.exports = router;