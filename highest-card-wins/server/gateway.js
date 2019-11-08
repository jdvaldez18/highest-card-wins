var proxy = require('express-http-proxy');
var express = require('express');
const app = express();

app.use(express.static('../build'));

app.use('/users', proxy('http://localhost:4000'));
// app.use('/lobby', proxy('http://localhost:4001'));
app.use('/winner', proxy('http://localhost:4003'));

app.listen(80);
