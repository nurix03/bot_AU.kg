var request   = require('request');
var async     = require('async');
var sequelize = require('../config');
const User    = sequelize.import("../../database/models/user");
const Rubric  = sequelize.import("../../database/models/rubric");

exports.CRUD = {
  createUser(namba_one_user) {
    return new Promise((resolve, reject) => {
      User.create({name: namba_one_user.name, namba_id: namba_one_user.id})
        .then((new_user) => {
          resolve(new_user.get({plain:true}));
        });
    });
  },

  addChatId(user, chat_id) {
    return new Promise((resolve, reject) => {
      User.update({
        chat_id: chat_id
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  deleteUser(user) {
    return new Promise((resolve, reject) => {
      User.destroy({
        where: {
          namba_id: user.id
        }
      }).then((user) => {
        resolve();
      });
    });
  },

  dropUserData(user) {
    return new Promise((resolve, reject) => {
      User.update({
        rubric: null,
        sub_rubric: null,
        rubric_choosen: false,
        sub_rubric_choosen: false,
        rubrics_sent: false,
        sub_rubrics_sent: false,
        sub_rubrics_length: null,
        sub_rubrics_page: 1
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then((user) => {
        console.log(user);
        resolve();
      });
    });
  },

  findAllUsers() {
    return new Promise((resolve, reject) => {
      User.findAll().then((users) => {
        resolve(users);
      });
    });
  },

  findUserOrCreate() {
    User.findOrCreate({where: {name: "Chokan", namba_id: 876808271}})
  },

  findUser(user) {
    namba_user_id = user.namba_user_id ?
    user.namba_user_id :
    user.namba_id

    return new Promise((resolve, reject) => {
      User.findOne({ where: {namba_id: namba_user_id} })
        .then(user => {
          resolve(user.dataValues);
        });
    })
  },

  setRubricState(user) {
    return new Promise((resolve, reject) => {
      User.update({
        rubrics_sent: true
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  setRubricForUser(user, rubric_index) {
    return new Promise((resolve, reject) => {
      User.update({
        rubric: rubric_index,
        rubric_choosen: true
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  setSubRubricLen(user, sub_rubrics) {
    sub_rubrics_len = sub_rubrics.length;
    return new Promise((resolve, reject) => {
      User.update({
        sub_rubrics_length: sub_rubrics_len
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  setSubRubricsSent(user) {
    return new Promise((resolve, reject) => {
      User.update({
        sub_rubrics_sent: true
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  setSubRubricForUser(user, index) {
    return new Promise((resolve, reject) => {
      User.update({
        sub_rubric: index,
        sub_rubric_choosen: true
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  incrementUserPage(user) {
    User.increment('sub_rubrics_page', {
      where: {
        namba_id: user.namba_id
      }
    });
    return;
  },

  dropUserPage(user) {
    return new Promise((resolve, reject) => {
      User.update({
        sub_rubrics_page: 1
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  },

  subscribeUser(user) {
    var state = user.subscription ? false : true;

    return new Promise((resolve, reject) => {
      User.update({
        subscription: state
      }, {
        where: {
          namba_id: user.namba_id
        }
      }).then(() => {
        resolve();
      });
    });
  }

}
