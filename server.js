var express = require("express");
var bodyparser = require("body-parser");
var _ = require("underscore");
var app = express();
var port = process.env.PORT || 3000;
var db = require('./db.js');

var todos1 = [{
    id: 1,
    description: 'Learning todo api using node.js...',
    completed: 'false'
}, {
    id: 2,
    description: 'will Learn Data Structures and Algorithms...',
    completed: 'false'
}, {
    id: 3,
    description: 'Learned Javascript the iwerd parts...',
    completed: 'true'
}]

var todoId = 1;

app.use(bodyparser.json());

app.get('/', function(req, res) {
    res.send('Todo API  welcomes you!!!');
});

app.get('/todos', function(req, res) {
    var queryParams = req.query;

    var where = {};
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


app.get('/todos/:id', function(req, res) {
    var todoid = parseInt(req.params.id);

    db.todo.findById(todoid).then(function(todo) {
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



app.post('/todos', function(req, res) {

    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo) {
        console.log('Data posted successfully');
        console.log(todo);
        res.json(todo);
    }).catch(function(error) {
        console.log(error);
        res.status(400).json(error);
    })

});


app.delete('/todos/:id', function(req, res) {
    var body = req.body;
    
    var id = parseInt(req.params.id);
    var where = { id : id};
    
    db.todo.destroy({where : where}).then(function(affectedRows) {
        if(affectedRows > 0) {
        res.send(affectedRows +' Rows are deleted');
        } else {
            res.status(404).json({error:'No records found!!!'});
        }
    }).catch(function(error){
        res.status(500).send(error);
    });
});

app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, 'description', 'completed');
    var matchedbody = _.findWhere(todos1, {
        id: todoId
    });
    var validProperties = {};

    if (!matchedbody) {
        res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validProperties.completed = body.completed;
    }
    else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description)) {
        validProperties.description = body.description;
    }
    else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedbody, validProperties);
    res.send('Values updated');
});

db.sequelize.sync().then(function() {
    app.listen(port, function(req, res) {
        console.log("Express Todo web server started...");
    });
});