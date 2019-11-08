const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const hash = require('object-hash');
const axios = require('axios');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const url = 'mongodb://localhost:27017';
const dbName = 'sixcardgolf';
const client = new MongoClient(url);

client.connect((err) => {
    console.log('Connected');

    db = client.db(dbName);

    app.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        let hashedPassword;

        const token = hash(Date.now());

        console.log("adding " + username)

        // Check if username exists
        db.collection('users')
            .find({ username: username })
            .toArray()
            .then(users => users.length)
            .then((length => {
                if (length > 0) {

                    res.sendStatus(403);
                    return;
                }

                // Hash password
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    hashedPassword = hash;

                    // Insert username, password, token
                    db.collection('users')
                        .insertOne({
                            username: username,
                            password: hashedPassword,
                            token: token,
                            score: 0,
                        })
                        .then(() => {
                            res.send(`Inserted ${username}`);
                        })
                        .catch(err => {
                            console.log(err);
                            res.send(err);
                        })
                });
            }));



    });

    app.post('/login', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        db.collection('users')
            .find({
                username: username,
            })
            .toArray()
            .then(found => {
                if (found.length == 0) {
                    res.sendStatus(404);
                    return;
                }
                bcrypt.compare(password, found[0].password, (err, result) => {
                    if (err || result == false) {
                        console.log(err);
                        res.sendStatus(404);
                        return;
                    }
                    res.send(found[0].token);
                });
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    });

    app.get('/scores', (req, res) => {
        db.collection('users')
            .find({})
            .project({
                username: true,
                score: true,
            })
            .sort({
                score: -1,
            })
            .limit(10)
            .toArray()
            .then(found => {
                res.send(found);
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    })
});

app.listen(4000);