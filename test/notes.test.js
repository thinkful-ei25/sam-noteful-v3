'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/notes');
const Folder = require('../models/folders');
const Tag = require('../models/tags');

const { notes, folders, tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API Note Tests', function(){
  
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, {useNewUrlParser: true});
  });

  beforeEach(function () {
    const noteInsertPromise = Note.insertMany(notes);
    const folderInsertPromise = Folder.insertMany(folders);
    const tagInsertPromise = Tag.insertMany(tags);
    return Promise.all([noteInsertPromise, folderInsertPromise, tagInsertPromise]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/notes', function(){

    it('should return the correct # of Notes and all correct fields', function(){
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');

      return Promise.all([dbPromise, apiPromise])
        .then(([data,res])=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(item=>{
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id', 'title', 'content', 'folderId','tags');
          });
        });

    });

    it('should return the correct search results for a searchTerm query', function(){
      
      const searchTerm = 'gaga';
      const re = new RegExp(searchTerm,'i');
      const reFilter = {$regex : re};
      const dbPromise = Note.find({title: reFilter});
      const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data,res])=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].id).to.equal(data[0].id);
        });

    });

    it('should return correct search results for a folderId query', function () {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          const dbPromise = Note.find({ folderId: data.id });
          const apiPromise = chai.request(app).get(`/api/notes?folderId=${data.id}`);
          return Promise.all([dbPromise, apiPromise]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return an empty array for non-matching query', function(){
      
      const searchTerm = 'NoWayThisMatchesAnything';
      const re = new RegExp(searchTerm, 'i');
      const reFilter = {$regex: re};
      const dbPromise = Note.find({title: reFilter});
      const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise,apiPromise])
        .then(([data,res])=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

  });

  describe('GET /api/notes/:id', function(){

    it('should return a correct note for a given id', function(){
      
      let data;
      return Note.findOne()
        .then(_data =>{
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'tags');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });

    });

    it('should respond with a 400 for an invalid id', function(){
      
      const invalidId = '666-666-666';
      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .catch(err=>err.response)
        .then(res=>{
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Invalid `ID` entered');
        });

    });

    it('should responde with a 404 for a non-existent id', function(){
      
      const unrealId = 'A0A0A0000000000000000100';
      return chai.request(app)
        .get(`/api/notes/${unrealId}`)
        .catch(err=>err.response)
        .then(res=>{
          expect(res).to.have.status(404);
        });

    });

  });

  describe('POST /api/notes', function(){
    
    it('should create and return a new note when provided valid inputs', function(){

      const newNote = {
        'title' : 'This is a test note',
        'content' : 'Testing stuff is found in here',
        'folderId': 'A0A0A0000000000000000100'
      };

      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then( _res =>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id','title', 'content', 'folderId', 'tags', 'createdAt', 'updatedAt');
          return Note.findById(res.body.id);
        })
        .then(data =>{
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });

    });

    it('should return an error when posting a new note with no title', function(){
      
      const newNote = {
        'content' : 'Test note with no title'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .catch(err=>err.response)
        .then(res=> {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });

    });

  });

  describe('PUT /api/notes/:id', function(){
    
    it('should update and return a note when provided valid inputs', function(){
      
      const updatedNote = {
        'title': 'test updated note',
        'content': 'this should be sufficient'
      };
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updatedNote);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'folderId', 'updatedAt', 'tags');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updatedNote.title);
          expect(res.body.content).to.equal(updatedNote.content);
        });

    });

    it('should respond with a 400 for an invalid id', function(){
      
      const invalidId = '666-666-666';
      const updatedNote = {
        title : 'Does not matter what i put in here',
        content : 'it really does not'
      };

      return chai.request(app)
        .put(`/api/notes/${invalidId}`)
        .send(updatedNote)
        .catch(err=>err.response)
        .then(res=>{
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Invalid `ID` entered');
        });
    });

    it('should respond with a 404 for a non-existent id', function(){
      
      const unrealId = 'A0A0A0000000000000000100';
      const updatedNote = {
        'title' : 'Does not matter what i put in here',
        'content' : 'it really does not'
      };

      return chai.request(app)
        .post(`/api/notes/${unrealId}`)
        .send(updatedNote)
        .catch(err=>err.response)
        .then(res=>{
          expect(res).to.have.status(404);
        });

    });

    it('should return an error when updating a note with no title', function(){
      
      const updatedNote = {
        'content' : 'it really does not matter what i put here'
      };

      return chai.request(app)
        .put('/api/notes/000000000000000000000000')
        .send(updatedNote)
        .catch(err=>err.response)
        .then(res =>{
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });


    });

  });

  describe('DELETE /api/notes/:id', function(){
    
    it('should delete a note by id', function(){
      let data;
      return Note.findOne()
        .then(_data =>{
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(res=>{
          expect(res).to.have.status(204);
        });
    });

  });

});