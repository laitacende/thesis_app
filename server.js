// TODO add too busy library, add Csurf
console.log('Server is starting...');
const path = require('path');


// initialize express
const https = require("https");
const fs = require("fs");
const express = require('express');
const session = require('express-session');
const app = express();
app.set('view engine', 'ejs')
app.set('view cache', false);
app.set('views', path.join(__dirname, 'website/webapp/views/'));
// server listens to port 3000
https
    .createServer({
            key: fs.readFileSync("sslcert/cert.key"),
            cert: fs.readFileSync("sslcert/cert.pem"),
        },
        app)
    .listen(4000, ()=> {
        console.log('Server is listening on port 4000..');
    });


// host static files
app.use(express.static(path.join(__dirname, 'website/webapp')));
app.use(express.static(path.join(__dirname, 'node_modules/dragula')));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    key: 'sessionid',
    // cookie: { secure: true, httpOnly: true, path: '/user', sameSite: true }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('./utils/routesGet'));
app.use(require('./utils/routesPost'));

// body parser to parse POST request
let bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: false }));

const Graph = require("./algorithms/structures/Graph");
const algorithms_functions = require("./algorithms/algorithms_functions");
const hungarian_algorithm = require("./algorithms/algorithms_implementations/hungarianAlgorithm");
const successive = require("./algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const cycle = require("./algorithms/algorithms_implementations/cycleCancellingAlgorithm");
const utils = require("./algorithms/utils");
