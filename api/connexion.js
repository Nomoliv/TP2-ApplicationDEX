const mysql = require("mysql2");

const connexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DexAppBD',
    port: 3306
});

connexion.connect((err) => {
    if (err) {
        console.error("erreur de conneion MySql :", err);
    } else {
        console.log("connexion à MySql réussie !");
    }
});

module.exports = connexion;