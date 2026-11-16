const express = require("express");
const router = express.Router();

const connexion = require("../connexion");
const verifierJeton = require("../middleware/verifierJeton");

router.get("/travaux", verifierJeton, (req, res) => {
    const sql = `
    SELECT travaux.*
    FROM travaux
    INNER JOIN cours
        ON travaux.cours_id = cours.id
    WHERE cours.utilisateur_id = ?
    `;

    connexion.query(
        sql,
        [req, utilisateurId],
        (err,  resultats) => {
            if(err){
                return res.status(500).json({
                    err: ["Erreur lors de la récupération des travaux"]
                })
            }

            res.json(resultats);
        }
    );
});

module.exports = router;