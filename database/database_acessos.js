require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: {
  host:'168.75.108.235',
    port : 3306,
    user : 'gerencie',
    password : 'mana2005',
    database : 'gerencie'
  }
});
module.exports = knex;

  