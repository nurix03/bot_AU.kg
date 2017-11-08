var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var async   = require('async');
var CRUD = require('./database/methods/CRUD').CRUD;
var helpers  = require('./methods/helpers');
var nambaApi = require('./methods/namba_one_api').nambaApi;
var auApi    = require('./methods/au_api').auApi;

var app = express();

var sequelize = require('./database/config');

sequelize
  .authenticate()
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// (async () => {
//   var users = await CRUD.findAllUsers();
//   await setTimeoutForSubscribedUsers(users);
// })();
//
// setTimeoutForSubscribedUsers = (users) => {
//   async.each(users, (user, cb) => {
//     (async () => {
//       var rubrics = await auApi.getRubrics();
//       var sub_rubric_id = await helpers.getSubRubricId(user, rubrics);
//       var auPosts = await auApi.getOneRubricPost(sub_rubric_id);
//       var vacancies = await helpers.extractDataFromAuPosts(auPosts);
//       if(user.subscription) {
//         setInterval(() => {
//           nambaApi.postToChat(vacancies, user.chat_id);
//         }, 5000);
//       }
//     })();
//   })
// }

module.exports = app;
