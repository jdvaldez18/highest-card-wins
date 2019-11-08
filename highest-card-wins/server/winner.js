const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const bodyParser = require('body-parser');

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



    app.post('/winner', (req, res) => {
        const username = req.body.username;

        db.collection('users')
            .find({
                username: username,
            })
            .project({
                score: true,
            })
            .toArray()
            .then(found => {
                console.log(found);
                db.collection('users')
                    .updateOne(
                        {
                            username: username,
                        },
                        {
                            $set: { score: parseInt(found[0].score) + 1 },
                        }
                    )
                    .then(() => {
                        console.log('Updated score to ' + (parseInt(found[0].score) + 1));
                        res.send('Updated score to ' + (parseInt(found[0].score) + 1))
                    })
                    .catch(err => {
                        console.log(err);
                        res.send(err);
                    })
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    });
});

app.listen(4003);