var express = require("express");
var bodyparser = require("body-parser");
var _ = require("underscore");
var app = express();
var port = process.env.PORT || 3000;

var todos = [{
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
    res.json(todos);
});

app.get('/todos/:id', function(req, res) {

    // todos.forEach(function(val) {
    //     if (val.id === parseInt(req.params.id)) {
    //         element = val;
    //     };
    // });

    var body = req.body;

    var element = _.findWhere(todos, {
        id: parseInt(req.params.id)
    });

    if (!element) {
        res.status(404).send('Request object not found in server...');
    }
    else {
        res.json(element);
    }
});

app.post('/todos', function(req, res) {

    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed || !_.isString(body.description))) {
        res.status(400).send();
    }

    body.id = todoId++;
    body.description = body.description.trim();
    todos.push(body);
    res.send(body);
});


app.delete('/todos/:id', function(req, res) {
    var body = req.body;
    var todoId = parseInt(req.params.id);
    var obj = _.findWhere(todos, {
        id: todoId
    });

    if (!obj) {
        res.status(404).json({ "error": "Requested id not found" });
    }
    else {
        todos = _.without(todos, obj);
        res.send(todos);
    }
});




app.listen(port, function(req, res) {
    console.log("Express Todo web server started...");
});