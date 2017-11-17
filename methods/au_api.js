var request = require('request');
var async   = require('async');
var messages = require('../config/messages');
var CRUD     = require('../database/methods/CRUD').CRUD;

var au_url = 'http://au.kg/mobile-api.php';

exports.auApi = {

  getRubrics: () => {
    return new Promise((resolve, reject) => {
      var form_data = {
        login: "au",
        f: "get_rubrics",
        limit: 1,
        page: 1
      }
      request.post({url:au_url, formData: form_data}, (err, httpResponse, body) => {
				console.log("Cant't get body: ", body)	
				if (err) throw (err);
        resolve(JSON.parse(body));
      });
    })
  },

  getTenRubricPosts: (sub_rubric_id, page) => {
    return new Promise((resolve, reject) => {
      var form_data = {
        login: "au",
        f: "get_post_by_subrubric",
        limit: 10,
        page: page,
        "subrubric[]": sub_rubric_id
      }
      request.post({url:au_url, formData: form_data}, (err, httpResponse, body) => {
        if (err) throw (err);
        resolve(JSON.parse(body));
      });
    })
  },

  getOneRubricPost: (sub_rubric_id) => {
    return new Promise((resolve, reject) => {
      var form_data = {
        login: "au",
        f: "get_post_by_subrubric",
        limit: 1,
        page: 1,
        "subrubric[]": sub_rubric_id
      }
      request.post({url:au_url, formData: form_data}, (err, httpResponse, body) => {
        if (err) throw (err);
        resolve(JSON.parse(body));
      });
    })
  }
}
