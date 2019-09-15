const express = require('express');
const app = express();
let multiparty = require('multiparty');
let aesjs = require('aes-js');

let key_256 = [178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193,
    194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206,
    207, 208, 209];

function crypt256(data) {
    let bytes = aesjs.utils.utf8.toBytes(data);
    let aesCtr = new aesjs.ModeOfOperation.ctr(key_256, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(bytes);
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
}

function decrypt256(data) {
    let encryptedBytes = aesjs.utils.hex.toBytes(data);
    let aesCtr = new aesjs.ModeOfOperation.ctr(key_256, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);
    let decrypted = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decrypted;
}

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

app.get('/profile', function (req, res) {
    res.render('profile');
});

app.post('/upload', function (req, res) {
    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        crypt256(fields.img[0]);
        res.send(decrypt256(crypt256(fields.img[0])));
    });
});

app.listen(9000);