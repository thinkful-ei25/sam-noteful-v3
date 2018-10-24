'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful Test', function(){
  
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/notes', function(){

    it('should return the correct # of Notes and all correct fields', function(){

    });

    it('should return the correct search results for a searchTerm query', function(){

    });

    it('should return an empty array for non-matching query', function(){

    });

  });

  describe('GET /api/notes/:id', function(){

    it('should return a correct note for a given id', function(){

    });

    it('should respond with a 400 for an invalid id', function(){

    });

    it('should responde with a 404 for a non-existent id', function(){

    });

  });

  describe('POST /api/notes', function(){
    
    it('should create and return a new note when provided valid inputs', function(){

    });

    it('should return an error when posting a new note with no title', function(){

    });

  });

  describe('PUT /api/notes/:id', function(){
    
    it('should update and return a note when provided valid inputs', function(){

    });

    it('should respond with a 400 for an invalid id', function(){

    });

    it('should respond with a 404 for a non-existent id', function(){

    });

    it('should return an error when updating a note with no title', function(){

    });

  });

  describe('DELETE /api/notes/:id', function(){
    
    it('should delete a note by id', function(){

    });

  });

});