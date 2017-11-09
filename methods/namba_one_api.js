var request = require('request');
var async   = require('async');
var access_config = require('../config/access');

create_chat_url = 'https://api.namba1.co/chats/create';
chats_url       = 'https://api.namba1.co/chats/';

exports.nambaApi = {
  createChat(user_id) {
    return new Promise((resolve, reject) => {
      var headers_data = {
        url: create_chat_url,
        method: 'POST',
        headers:{'X-Namba-Auth-Token': access_config.token},
        body:{
            'members': [user_id]
        },
        json: true
      }
      request(headers_data, function(err, response, body) {
        resolve(body.data.id);
      });
    })
  },

  postToChat(msg, chat_id) {
    return new Promise((resolve, reject) => {
      var headers_data = {
        url: chats_url + chat_id + '/write',
        method: 'POST',
        headers:{'X-Namba-Auth-Token': access_config.token},
        body:{
          type:'text/plain',
          content: msg
        },
        json: true
      }
      request(headers_data, function(err, response, body) {
        if (!body.success) {
          reject(new Error("Chokan: Could't POST to chat."));
        }
        resolve({success: true});
      });
    })
  },

  postToChatWithDelay(msg, chat_id) {
    return new Promise((resolve, reject) => {
      var headers_data = {
          url: chats_url + chat_id + '/write',
          method: 'POST',
          headers:{'X-Namba-Auth-Token': access_config.token},
          body:{
            type:'text/plain',
            content: msg
          },
          json: true
      }

      request(headers_data, function(err, response, body) {
        if (!body.success) {
          reject(new Error("Chokan: Could't POST to chat."));
        }
        resolve({success: true});
      });
    });
  },

  setTyping(chat_id) {
    return new Promise(function(resolve, reject) {
      var headersData = {
        url:'https://api.namba1.co/chats/' + chat_id + '/typing',
        method: 'GET',
        headers:{'X-Namba-Auth-Token':access_config.token},
        json: true
      }
      request(headersData, function(err, response, body) {
        resolve ()
      })
    });
  }
}
