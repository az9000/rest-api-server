const app = require('express')();
const words = require('./words.json');

const PORT = process.env.PORT || 3000;

app.get("", (req, res) => {
    res.send(`There are ${words.length} entries in the dictionary!`);
});

app.listen(PORT, () => {
    console.log(`App up at PORT ${PORT}`);
});