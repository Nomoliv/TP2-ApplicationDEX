const express = require("express");
const router = express.Router();

const connexion = require("../connexion");

router.get('/', (req, res) => {
    connexion.query('SELECT * FROM cours', (err, resultats) =>{
        if (err) {
            return res.status(500).json(
                {err: ["Erreur lors de la récupération des cours"]});

}
res.json(resultats);

    });

});

module.exports = router;