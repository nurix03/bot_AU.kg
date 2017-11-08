const Sequelize = require('sequelize');
const sequelize = new Sequelize('vacancy', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  timezone: '+06:00',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

module.exports = sequelize;
