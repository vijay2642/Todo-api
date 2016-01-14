
var env = process.env.NODE_ENV || 'development';
var Sequelize = require('sequelize');
var sequelize;

if(env === 'production') {
    sequelize = new sequelize(process.env.DATABASE_URL, {
        'dialect' : 'postgresql'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/todo-dev-api.sqlite'
});
}

// var sequelize = new Sequelize(undefined, undefined, undefined, {
//     'dialect': 'sqlite',
//     'storage': __dirname + '/data/todo-dev-api.sqlite'
// });

var db = {};
db.Todo = sequelize.import(__dirname+'/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
