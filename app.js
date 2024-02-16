const express = require('express');
const app = express();
app.use(express.json());

var path = require('path');

app.use(express.static(path.join(__dirname, '')));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const words = require('./words.json');

const fileSystem = require('./storage');

const PORT = process.env.PORT || 3000;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

app.options("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://example.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log('Serer listening on PORT: ', PORT);
});

app.get('/', (request, response) => {
    response.sendFile('/index.html');
});

let oldArray = [];
let duplicateCount = 0;
let round = 0;
let wordCount = 0;
// Get words
// Example: https://<ip>/api/words/limit/10
app.get('/api/words/limit/:limit', (request, response, next) => {
    // console.log(request.query);    
    let limit = parseInt(request.params.limit, 10);
    if (limit === 0) {
        limit = 20;
    }

    // First, get words from the need-review list
    const result = fileSystem.readFile(0).then(res => {
        let wordsArray = [];
        for (let i = 0; i < res.data.length; i++) {
            wordsArray.unshift(words.find(x => x.id === parseInt(res.data[i])));
            if (!oldArray.find(x => x === parseInt(res.data[i]))) {
                wordCount++;
            }
        }                
        if (wordsArray.length === limit) {
            console.log('Words served:', wordCount);
            response.json({
                message: "success",
                data: wordsArray
            });
        }
        
        while (wordsArray.length < limit) {
            rnum = getRandomIntInclusive(0, words.length);
            if (!words[rnum]) {
                continue;
            }
            if (!wordsArray.find(x => x.id === words[rnum].id)) {
                if (!oldArray.find(x => x === words[rnum].id)) {
                    wordsArray.unshift(words[rnum]);
                    oldArray.push(words[rnum].id);
                    wordCount++;
                    // console.log('add id ', words[rnum].id, wordsArray.length)
                } else {
                    duplicateCount++;
                }
            }
        }
        console.log('Words served:', wordCount, ` (with ${duplicateCount} duplicates found!`);
        round++;
        if (round > 30) {
            round = 0;
            oldArray = [];
        }
        response.json({
            message: "success",
            data: wordsArray
        });
    });
});

// Get word by ID
// Example: https://<ip>/api/words/1234
app.get('/api/words/id/:id', (request, response) => {
    let id = parseInt(request.params.id, 10);
    if (id <= 0) {
        id = 514;
    }
    const found = words.find(x => x.id === id);
    response.json({
        message: found ? "success" : "id not found",
        data: words.find(x => x.id === id)
    });
});

// Get need-review list
// Example: https://<ip>/api/review/limit/20
app.get('/api/review/limit/:limit', (request, response, next) => {
    let limit = parseInt(request.params.limit, 10);
    if (limit <= 0) {
        limit = 20;
    }
    const result = fileSystem.readFile(0).then(res => {
        if (res.data.length <= limit) {
            response.send(res);
        } else {
            response.send({
                message: res.message,
                data: res.data.length > 0 ? res.data.slice(0, limit) : []
            })
        }
    })
});

let wordsSaved = 0;
// Add to need-review list
// Example: https://<ip>/api/review/1234
app.post('/api/review/', (request, response, next) => {
    let errors = [];
    const word_id = parseInt(request.body.word_id, 10);
    if (!word_id) {
        errors.push("No ID specified!");
    }
    if (errors.length > 0) {
        response.status(400).json({ "error": errors.join(",") });
        return;
    }
    const result = fileSystem.readFile(word_id).then(res => {
        if (res.message === 'success') {
            wordsSaved++;
        }
        console.log('Words saved:', wordsSaved);
        fileSystem.saveFile(res.data.toString()).then(saved => {
            response.send(res);        
        })
    })
});

// Delete an ID: 
// Example: https://<ip>/api/review/1234
app.delete('/api/review/:id', (request, response) => {
    let errors = [];
    const word_id = parseInt(request.params.id, 10);
    if (!word_id) {
        errors.push("No ID specified!");
    }
    if (errors.length > 0) {
        response.status(400).json({ "error": errors.join(",") });
        return;
    }
    const result = fileSystem.deleteFromFile(parseInt(request.params.id)).then(res => {
        if (res.message === 'success') {
            wordsSaved--;
        }
        console.log('Words saved:', wordsSaved);
        fileSystem.saveFile(res.data.toString()).then(saved => {
            response.send(res);        
        })
    })
})

// Default response for any other request
app.use(function (req, res) {
    res.status(404);
});



// const app = require('express')();
// const words = require('./words.json');
// const fs = require('fs');

// const PORT = process.env.PORT || 3000;

// const MAX_WORDS = 30;

// function getRandomIntInclusive(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
// }

// app.options("/", (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "https://example.com");
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     res.sendStatus(204);
// });

// app.get("", (req, res) => {
//     res.send(`There are ${words.length} entries in the dictionary!\nUse /words/r to get 30 random objects!`);
// });

// app.get("/words/:max", (req, res) => {
    
//     fs.readFile('/data/test.txt', (err, data) => {
//         if (err) console.log('Error:', err);
//         console.log('data:', data);
//     })

//     // number of entries
//     var num = parseInt(req.params.max, 10);
//     if (num === 0) {
//         num = MAX_WORDS;
//     }
//     // get a random number
//     var len = words.length;
//     var rnum = getRandomIntInclusive(0, len);
//     var wordsArray = [];
//     wordsArray.unshift(words[rnum]);
//     if (num > 1) {
//         for (var i = 0; i < len; i++) {
//             rnum = getRandomIntInclusive(0, len);
//             for (var j = 0; j < wordsArray.length; j++) {
//                 if (wordsArray[j]['id'] != words[rnum]['id']) {
//                     wordsArray.unshift(words[rnum]);

//                     break;
//                 }
//             }
//             if (wordsArray.length === num) {
//                 break;
//             }
//         }
//     }

//     res.send(wordsArray);
// });

// app.get("/verbs", (req, res) => {

//     // get a random number
//     var len = words.length;
//     var wordsArray = [];
//     for (var i = 0; i < len; i++) {
//         if (words[i]['isVerb']) {
//             wordsArray.unshift(words[i]);
//         }
//     }

//     res.send('size:' + wordsArray);
// });

// app.listen(PORT, () => {
//     console.log(`App up at http://localhost:${PORT}`);
// });