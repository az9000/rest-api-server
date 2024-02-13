const fs = require('fs');

const fileNme = '/data/review.json';

if (!fs.existsSync(fileNme)) {
    fs.open(fileNme, 'w', function (err, file) {
        if (err) throw err;
        console.log('Opened!');
    });
}

const fileSystem = {

    readFile: async (word_id) => {
        let arr = [];
        const contents = fs.readFileSync(fileNme);

        const list = contents.toString().length > 0 ? contents.toString().split(',') : [];

        let isDuplicate = false;
        for (let i = 0; i < list.length; i++) {
            if (word_id > 0) {
                isDuplicate = (parseInt(list[i]) === word_id);
                if (!isDuplicate) {
                    arr.push(list[i]);
                }
            } else {
                arr.push(list[i]);
            }
        }
        
        if (!isDuplicate && word_id > 0) {
            arr.push(word_id.toString())
        };

        let obj = {};

        obj = {
            "message": (!isDuplicate) ? "success" : "id already exists",
            "data": arr
        };

        return obj;
    },

    saveFile: async (data) => {
        const result = fs.writeFileSync(fileNme, data);
    },

    deleteFromFile: async (word_id) => {
        let arr = [];
        const contents = fs.readFileSync(fileNme);

        const list = contents.toString().split(',');
        let found = false;
        for (let i = 0; i < list.length; i++) {
            found = (parseInt(list[i]) === word_id);
            if (!found) {
                arr.push(list[i]);
            }
        }

        obj = {
            "message": "success",
            "data": arr
        };

        return obj;
    }
}


module.exports = fileSystem;
