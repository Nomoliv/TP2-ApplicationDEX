const express = require("express");
const router = express.Router();

const connexion = require("../connexion");
const verifiJeton = require("../middleware/verifiJeton");

router.get("/travaux", verifiJeton, (req, res) => {
    const sql = `
    SELECT travaux.*
    FROM travaux
    INNER JOIN cours
        ON travaux.cours_id = cours.id
    WHERE cours.utilisateur_id = ?
    `;

    connexion.query(
        sql,
        [req.utilisateurId],
        (err,  resultats) => {
            if(err){
                return res.status(500).json({
                    erreurs: ["Erreur lors de la récupération des travaux"]
                })
            }

            res.json(resultats);
        }
    );
});

module.exports = router;