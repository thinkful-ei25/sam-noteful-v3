'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tags');
const Note = require('../models/notes');

//GET/READ ALL TAGS

router.get('/', (req,res,next)=>{

  let projection = {name: 1};

  Tag.find({}, projection)
    .sort('name')
    .then(result=>{
      res.json(result);
    })
    .catch(err=>{
      next(err);
    });
  
});

//GET/READ SINGLE TAG BY ID

router.get('/:id', (req,res,next)=>{

  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  let projection = {name : 1};
  Tag.findById(id,projection)
    .then(result=>{
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err=>next(err));

});

//POST NEW TAG

router.post('/', (req,res,next)=>{
  const { name } = req.body;

  if(!name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  Tag.create(newTag)
    .then(result=>{
      let returned = {name: result.name, id: result.id};
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(returned);
    })
    .catch(err=>{
      if(err.code === 11000){
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});

//PUT A SINGLE TAG

router.put('/:id', (req,res,next)=>{
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

  const updateTag = { name };
  const updateNew = {new: true};

  Tag.findByIdAndUpdate(id, updateTag, updateNew)
    .then(result =>{
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err=>{
      if(err.code === 11000){
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});

//DELETE A TAG

router.delete(':/id', (req,res,next)=>{
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Invalid `ID` entered');
    err.status = 400;
    return next(err);
  }

  const tagRemovePromise = Tag.findByIdAndRemove(id);

  const noteUpdatePromise = Note.updateMany(
    {'tags' : id},
    { '$pull' : { 'tags' : id }  }
  );

  Promise.all([tagRemovePromise,noteUpdatePromise])
    .then(([tagResult]) => {
      if(tagResult){
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);

});

module.exports = router;