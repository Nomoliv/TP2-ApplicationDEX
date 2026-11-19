const express = require("express");
const router = express.Router();

const connexion = require("../connexion");

router.get("/", (req, res) => {

    console.log("Route GET /api/cours appelée");

    connexion.query("SELECT * FROM cours", (err, resultats) => {

        if (err) {
            console.log("ERREUR MYSQL :", err.message);

            return res.status(500).json({
                erreurs: ["Erreur lors de la récupération des cours"]
            });
        }

        console.log("Cours récupérés :", resultats.length);

        res.json(resultats);
    });

});

module.exports = router;