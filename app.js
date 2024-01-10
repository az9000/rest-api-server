const app = require('express')();
const words = require('./words.json');

const PORT = process.env.PORT || 3000;

const MAX_WORDS = 30;

app.get("", (req, res) => {
    res.send(`There are ${words.length} entries in the dictionary!`);
});

app.get("/words/r", (req, res) => {
    // get a random number
    var len = words.length;
    var rnum = Math.floor(Math.random() * (len + 1) + 0);
    var wordsArray = [];
    wordsArray.unshift(words[rnum]);
    for (var i=0; i < len; i++) {
        rnum = Math.floor(Math.random() * (len + 1) + 0);
        for (var j=0; j < wordsArray.length; j++) {
            if (wordsArray[j]['id'] != words[rnum]['id']) {
                wordsArray.unshift(words[rnum]);
                
                break;
            }
        }
        if (wordsArray.length === MAX_WORDS) {
            break;
        }
    }

    res.send(wordsArray);
});

app.listen(PORT, () => {
    console.log(`App up at PORT ${PORT}`);
});