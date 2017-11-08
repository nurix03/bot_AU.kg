var request = require('supertest');
var app     = require('../app');
var should  = require('should');

var CRUD    = require('../database/methods/CRUD').CRUD;

describe("Index Route", () => {
  describe("POST", () => {
    before(() => {
      CRUD.findUserOrCreate();
    });

    it("Should recieve: 200 & welcome user.", (done) => {
      request(app).post('/')
        .send({event: "user/follow", data:{id: 876808271, name: 'ChTest'}})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.msg.should.equal('Created user and sent msg.');
          done();
        });
    });

    it("Should recieve: 200 & delete user.", (done) => {
      request(app).post('/')
        .send({event: "user/unfollow", data:{id: 876808271, name: 'ChTest'}})
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          res.body.msg.should.equal('Deleted user.');
          done();
        });
    });

    it("Should recieve: 200 & Sent rubrics.", (done) => {
      data = { sender_id: 876808271,
               chat_id: 35274,
               content: '1'}

      request(app).post('/')
        .send({event: "message/new", data: data})
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          res.body.msg.should.equal('Sent rubrics.');
          done();
        })
    })

  });
});
