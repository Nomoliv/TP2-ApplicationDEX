const mysql = require("mysql2");

const connexion = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "",
    database: "DexAppBD",
    port: 3306

});

// Connexion à MySQL
connexion.connect((err) => {

    if (err) {
        console.error("Erreur de connexion MySQL :", err.message);
    } else {
        console.log("Connexion à MySQL réussie !");
    }

});

module.exports = connexion;
