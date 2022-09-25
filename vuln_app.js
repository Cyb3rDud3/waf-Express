const express = require('express');
const app = express();
const {requestMiddleware, responseMiddleware} = require('./waf.js')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (info TEXT)");

    const stmt = db.prepare("INSERT INTO users VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM users", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
});


app.use(requestMiddleware({
    resType: 'json',
    resStatusCode: 403,
    resData: { 'h': 'hello world' }

}));



app.get('/user/:id', (req, res) => {
    const params = req.params.id
    db.get("SELECT * FROM users WHERE rowid = " + params, function (err, row) { 
        if (err) {        return res.json({ 'a': err })}
        return res.json({ 'a': row })

    

    });
})
app.listen('8000')
