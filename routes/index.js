var express = require('express');
var async = require('async');
var router = express.Router();

var nambaApi = require('../methods/namba_one_api').nambaApi;
var auApi = require('../methods/au_api').auApi;

var CRUD = require('../database/methods/CRUD').CRUD;
var messages = require('../config/messages');
var helpers = require('../methods/helpers');

var  startCommands = ['Start', 'start', 'Старт', 'старт'];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.post('/', function(req, res) {
  var event = req.body.event;
  var data = req.body.data;

  if (event == 'user/follow') {
    (async () => {
      try {
        var chat_id = await createAndWelcomeUser(data);
        var namba_user_data = {
          namba_user_id: data.id,
          content: "",
          chat_id: chat_id
        };
        await answerToUser(namba_user_data);
        res.status(200).send({
          msg: 'Created user and sent msg.'
        })
      } catch (err) {
        console.log(err);
      }
    })();
  }

  if (event == 'user/unfollow') {
    (async () => {
      try {
        await CRUD.deleteUser(data);
        res.status(200).send({
          msg: 'Deleted user.'
        })
      } catch (err) {
        console.log(err);
      }
    })();
  }

  if (event == 'message/new') {
    var namba_user_data = {
      namba_user_id: data.sender_id,
      content: data.content,
      chat_id: data.chat_id
    };
    (async () => {
      await nambaApi.setTyping(namba_user_data.chat_id);
      try {
        var answer = await answerToUser(namba_user_data);
        res.status(200).send({
          msg: answer
        });
      } catch (err) {
        console.log(err);
      }
    })();
  }
});

async function createAndWelcomeUser(namba_one_user) {
  let new_user = await CRUD.createUser(namba_one_user);
  let chat_id = await nambaApi.createChat(new_user.namba_id);
  let updated_user = await CRUD.addChatId(new_user, chat_id)
  await nambaApi.postToChat(messages.greeting, chat_id);
  return (chat_id);
}

async function answerToUser(namba_user_data) {
  if (startCommands.indexOf(namba_user_data.content) >= 0) {
    await CRUD.dropUserData(namba_user_data);
  }
  user = await CRUD.findUser(namba_user_data);
  var user_case = await helpers.defineUsersCase(user);
  var rubrics = await helpers.getRubrics();

  if (user_case.user_is_set) {
    var action = await helpers.defineUserAction(namba_user_data.content);
    if (action.invalid) {
      await nambaApi.postToChat(
        messages.invalid_content, namba_user_data.chat_id);
      return;
    }
    await takeAction(user, action);
    return;
  }

  if (user_case.choose_rubric) {
    var rubric_names = await helpers.getRubricNames(rubrics);
    await nambaApi.postToChat(rubric_names, namba_user_data.chat_id);
    await CRUD.setRubricState(user);
    return ('Sent rubrics.');
  }

  if (user_case.user_sent_rubric_num) {
    var rubric_index = await helpers.isRubricValid(namba_user_data.content);
    if (rubric_index.invalid) {
      await nambaApi.postToChat(
        messages.invalid_content, namba_user_data.chat_id);
      return;
    }
    await CRUD.setRubricForUser(user, rubric_index);
    await updateUsersSubRubric(user, rubric_index);
    return;
  }

  if (user_case.user_sent_sub_rubric_num) {
    var sub_rubric_index = await helpers.isSubRubricValid(user,
      namba_user_data.content);
    if (sub_rubric_index.invalid) {
      await nambaApi.postToChat(
        messages.invalid_content, namba_user_data.chat_id);
      return;
    }
    await CRUD.setSubRubricForUser(user, sub_rubric_index);
    var updated_user = await CRUD.findUser(namba_user_data);
    var sub_rubric_id = await helpers.getSubRubricId(updated_user, rubrics);
    var auPosts = await auApi.getTenRubricPosts(
      sub_rubric_id, user.sub_rubrics_page);
    var vacancies = await helpers.extractDataFromAuPosts(user, auPosts);
    await CRUD.incrementUserPage(user);
    await nambaApi.postToChat(vacancies.msg, user.chat_id);
    await helpers.delay();
    var msg = user.subscription ? messages.avail_commands_unsubscribe : messages.avail_commands_subscribe
    await nambaApi.postToChatWithDelay(
      messages.available_commands + msg, user.chat_id);
    return;
  }
}

async function updateUsersSubRubric(user, rubric_index) {
  var rubrics = await auApi.getRubrics();
  var sub_rubric_names = await helpers.defineSubRubrics(
    rubrics[rubric_index].subrubrics);
  await CRUD.setSubRubricLen(user, rubrics[rubric_index].subrubrics)
  await CRUD.setSubRubricsSent(user);
  if (rubrics[rubric_index].subrubrics.length == 1) {
    await CRUD.setSubRubricForUser(user, 0);
    var updated_user = await CRUD.findUser(user);
    var sub_rubric_id = await helpers.getSubRubricId(updated_user, rubrics);
    var auPosts = await auApi.getTenRubricPosts(
      sub_rubric_id, user.sub_rubrics_page);
    var vacancies = await helpers.extractDataFromAuPosts(user, auPosts);
    await CRUD.incrementUserPage(user);
    await nambaApi.postToChat(vacancies.msg, user.chat_id);
    await helpers.delay();
    var msg = user.subscription ? messages.avail_commands_unsubscribe : messages.avail_commands_subscribe
    await nambaApi.postToChatWithDelay(
      messages.available_commands + msg, user.chat_id);
    return;
  }
  else {
    await nambaApi.postToChat(sub_rubric_names, user.chat_id);
    return;
  }
}

async function takeAction(user, action) {
  if (action.drop_user_data) {
    await CRUD.dropUserData(user);
    var rubrics = await helpers.getRubrics();
    var rubric_names = await helpers.getRubricNames(rubrics);
    await nambaApi.postToChat(rubric_names, user.chat_id);
    await CRUD.setRubricState(user);
    return;
  }

  if (action.get_more_vacancy) {
    var rubrics = await helpers.getRubrics();
    var sub_rubric_id = await helpers.getSubRubricId(user, rubrics);
    var auPosts = await auApi.getTenRubricPosts(
      sub_rubric_id, user.sub_rubrics_page);
    var vacancies = await helpers.extractDataFromAuPosts(user, auPosts);
    await CRUD.incrementUserPage(user);
    await nambaApi.postToChat(vacancies.msg, user.chat_id);
    await helpers.delay();
    var avail_commands = vacancies.out_of_limit ?
        messages.available_command_when_out_of_limit : messages.available_commands

    var msg = user.subscription ? messages.avail_commands_unsubscribe : messages.avail_commands_subscribe

    await nambaApi.postToChatWithDelay(
      avail_commands + msg, user.chat_id);
    return;
  }

  if (action.subscribe) {
    await CRUD.subscribeUser(user);
    var updated_user = await CRUD.findUser(user);
    var msg = updated_user.subscription ?
      messages.subscriptionMsg : messages.unSubscriptionMsg
    await nambaApi.postToChat(msg, user.chat_id);
    return;
  }
}

module.exports = router;
