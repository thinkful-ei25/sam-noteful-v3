'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Folder = require('../models/folders');
const Note = require('../models/notes');


//GET all /folders

router.get('/', (req, res, next) => {

  let projection = {name: 1};

  Folder.find({}, projection)
    .sort('name')
    .then(result=>{
      res.json(result);
    })
    .catch(err=>{
      next(err);
    });

});

//GET /folders by id

router.get('/:id', (req,res,next) => {
  const id = req.params.id;

  //validate ID
  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  let projection = {name: 1};
  Folder.findById(id, projection)
    .then(result=>{
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err=>next(err));



});

//POST /folders to create new folder

router.post('/', (req,res,next) => {
  const { name } = req.body;

  if(!name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = { name };

  Folder.create(newFolder)
    .then(result=>{
      let returned = {name : result.name, id: result.id};
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(returned);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
  
});

//PUT /folders by id to update a folder name

router.put('/:id', (req,res,next) =>{
  const id = req.params.id;
  const { name } = req.body;

  if(!name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  const updateFolder = { name };
  const updateNew = {new: true};

  Folder.findByIdAndUpdate(id, updateFolder, updateNew)
    .then(result =>{
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err=>{
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

//DELETE /folders by id which deletes the folder and the related notes

router.delete('/:id', (req,res,next) => {
  const id = req.params.id;

  const folderRemovePromise = Folder.findByIdAndRemove({_id: id});
  const noteRemovePromise = Note.deleteMany({folderId: id});
  
  Promise.all([folderRemovePromise, noteRemovePromise])
    .then(results =>{
      const folderResult = results[0];
      if(folderResult){
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err=>next(err));

});

module.exports = router;