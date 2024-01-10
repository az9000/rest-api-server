const app = require('express')();
const words = require('./words.json');

const PORT = process.env.PORT || 3000;

const MAX_WORDS = 30;

app.get("", (req, res) => {
    res.send(`There are ${words.length} entries in the dictionary!\nUse /words/r to get 30 random objects!`);
});

app.get("/words/:max", (req, res) => {
    // number of entries
    var num = parseInt(req.params.max, 10);
    if (num === 0) {
        num = MAX_WORDS;
    } 
    // get a random number
    var len = words.length;
    var rnum = Math.floor(Math.random() * (len + 1) + 0);
    var wordsArray = [];
    wordsArray.unshift(words[rnum]);
    if (num > 1) {
        for (var i=0; i < len; i++) {
            rnum = Math.floor(Math.random() * (len + 1) + 0);
            for (var j=0; j < wordsArray.length; j++) {
                if (wordsArray[j]['id'] != words[rnum]['id']) {
                    wordsArray.unshift(words[rnum]);
                    
                    break;
                }
            }
            if (wordsArray.length === num) {
                break;
            }
        }
    }

    res.send(wordsArray);
});

app.listen(PORT, () => {
    console.log(`App up at PORT ${PORT}`);
});