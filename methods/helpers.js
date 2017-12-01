var request = require('request');
var async   = require('async');
var messages = require('../config/messages');
var CRUD     = require('../database/methods/CRUD').CRUD;

var au_url = 'http://au.kg/mobile-api.php';

module.exports = {
  defineUsersCase: (user) => {
    return new Promise((resolve, reject) => {
      if (user.rubric_choosen && user.sub_rubric_choosen) {
        resolve({user_is_set: true})
      }

      if (!user.rubric_choosen && !user.rubrics_sent) {
        resolve({choose_rubric: true});
      }

      if (!user.rubric_choosen && user.rubrics_sent) {
        resolve({user_sent_rubric_num: true});
      }

      if (!user.sub_rubric_choosen && user.sub_rubrics_sent) {
        resolve({user_sent_sub_rubric_num: true});
      }
    });
  },

  defineUserAction: (content) => {
    return new Promise((resolve, reject) => {
      if (content == '0') {
        resolve({drop_user_data: true});
      }

      if (content == '1') {
        resolve({get_more_vacancy: true});
      }

      if (content =='2') {
        resolve({subscribe: true});
      }
      else {
        resolve({invalid:true});
      }
    });
  },

  getRubrics: () => {
    return new Promise((resolve, reject) => {
      var form_data = {
        login: "au",
        f: "get_rubrics",
        limit: 1,
        page: 1
      }
      request.post({url:au_url, formData: form_data}, (err, httpResponse, body) => {
        if (err) throw (err);
        resolve(JSON.parse(body));
      });
    })
  },

  getRubricNames: (rubrics) => {
    return new Promise((resolve, reject) => {
      var msg = messages.choose_rubric;
      for(i=0; i<rubrics.length; i++) {
        msg += messages.emoji_nums[i] +
                  rubrics[i].rubric + '.\n'
      }
      resolve(msg);
    });
  },

  isRubricValid: (num) => {
    if (messages.valid_nums.includes(num)) {
      return (parseInt(num) - 1);
    }
    return ({invalid: true});
  },

  isSubRubricValid: (user, num) => {
    var sub_rubric_indexes = [];
    for (i=0; i<user.sub_rubrics_length; i++) {
      sub_rubric_indexes.push(messages.valid_nums[i]);
    }

    if (sub_rubric_indexes.includes(num)) {
      return (parseInt(num) - 1);
    }
    return ({invalid: true});
  },

  defineSubRubrics: (sub_rubrics) => {
    return new Promise((resolve, reject) => {
      var msg = messages.choose_sub_rubric;
      for(i=0; i<sub_rubrics.length; i++) {
        msg += messages.emoji_nums[i] +
              sub_rubrics[i].subrubric + '.\n'
      }
      resolve(msg);
    });
  },

  getSubRubricId: (user, rubrics) => {
    return (rubrics[user.rubric].subrubrics[user.sub_rubric].subrubric_id)
  },

  extractDataFromAuPosts: (user, au_posts) => {
    return new Promise((resolve, reject) => {
      if (au_posts == null) {
        CRUD.dropUserPage(user);
        resolve({out_of_limit:true, msg:messages.sub_rubrics_out_of_limit});
      }
      var posts = "";

      for(i=0; i<au_posts.length; i++) {
        header = au_posts[i].header.replace(/(\r\n|\n|\r)/gm,"");
        var empty = au_posts[i].salary == "";
        var empty2 = au_posts[i].profession == "Не определено"
        var salary =  empty ? "Договорная" : au_posts[i].salary;
        var profession =  empty2 ? "" : au_posts[i].profession;


        posts += "=========== " + messages.emoji_nums[i] + " ============\n\n" + '💼' + header + "\n💰 " + salary + "\n🏭"+ profession + "\n💬" + au_posts[i].body + "\n" + "\n🔗" + au_posts[i].link + "\n 📞 : " + au_posts[i].telephone + "\n\n";
      }
      resolve({out_of_limit:false, msg:posts});
    })
  },

  delay: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    })
  }

}
