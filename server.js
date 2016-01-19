var express = require("express");
var bodyparser = require("body-parser");
var _ = require("underscore");
var app = express();
var port = process.env.PORT || 3000;
var db = require('./db.js');
var bcrypt = require("bcrypt");
var middleware = require('./middleware')(db);

app.use(bodyparser.json());

app.get('/', function(req, res) {
    res.send('Todo API  welcomes you!!!');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var queryParams = req.query;
    var user_id = req.user.get('id');
    var where = {};
    where.userId = user_id; 
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        where.completed = true;
    }
    else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        where.completed = false;
    }


    if (queryParams.hasOwnProperty('description') && queryParams.description.length > 0) {
        where.description = {
            $like: '%' + queryParams.description + '%'
        }
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        res.json(todos);
    }).catch(function(error) {
        res.status(500).send();
    });
});


app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoid = parseInt(req.params.id);
    var where = {};
    where.userId = req.user.get('id');
    where.id = todoid;
    //db.todo.findById(todoid).then(function(todo) {
      db.todo.findOne({where: where}).then(function(todo) {
        if (todo) {
            res.json(todo.toJSON());
        }
        else {
            res.status(404).send();
        }
    }).catch(function(error) {
        res.status(500).send(error);
    });
});



app.post('/todos', middleware.requireAuthentication, function(req, res) {

    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo) {
        req.user.addTodo(todo).then(function() {
            return todo.reload();
        }).then(function(todo) {
            res.json(todo);
        })
    }).catch(function(error) {
        res.status(400).json(error);
    })

});


app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var body = req.body;

    var id = parseInt(req.params.id);
    var user_id = req.user.get('id');
    var where = {
        id: id,
        userId: user_id
    };

    db.todo.destroy({
        where: where
    }).then(function(affectedRows) {
        if (affectedRows > 0) {
            res.send(affectedRows + ' Rows are deleted');
        }
        else {
            res.status(404).json({
                error: 'No records found!!!'
            });
        }
    }).catch(function(error) {
        res.status(500).send(error);
    });
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, 'description', 'completed');
    var user_id = req.user.get('id');
    var attributes = {};
    
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    

    //db.todo.findById(todoId).then(function(todo) {
      db.todo.findOne({where: {
          id: todoId,
          userId: user_id
      }}).then(function(todo){
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(error) {
                res.status(400).json(error);
            })
        }
        else {
            res.status(404).send();
        }
    })
});


// Users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(error) {
        res.status(400).json(error);
    });
});


app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        if (token) {
            res.header('auth', user.generateToken('authentication')).json(user.toPublicJSON());
        }
        else {
            res.status(401).send();
        }

    }, function(error) {
        res.status(401).send(error);
    });
})


db.sequelize.sync({
   // force: true
}).then(function() {
    app.listen(port, function(req, res) {
        console.log("Express Todo web server started...");
    });
});