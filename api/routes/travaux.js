const express = require("express");
const router = express.Router();
const verifierJeton = require('../middleware/verifierJeton');

const connexion = require("../connexion");

router.get("/", (req, res) => {

    const cours = req.query.cours;

    let sql = "SELECT * FROM travaux WHERE ouvert = true";
    let valeurs = [];

    if (cours) {
        sql += " AND cours_id = ?";
        valeurs.push(cours);
    }
    connexion.query(sql, valeurs, (err, resultats) =>{
        if (err) {
            return res.status(500).json(
                {err: ["Erreur lors de la récupération des travaux"]});

}
res.json(resultats);

    });

});
router.get("/:id", (req, res) => {

    const id  = req.params.id;
    const sql = "SELECT * FROM travaux WHERE id = ?";

connexion.query(sql, [id], (err, resultats) => {
    if(err) {
        return res.status(500).json({err: ["Erreur lors de la récupération du travail"]});

}

if (resultats.length === 0) {
    return res.status(404).json({err: ["travail introuvable"]});

}
res.json(resultats[0]);

});

});

router.get("/:id/disponibilites", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT
         disponibilites.matricule,
         disponibilites.nom,
         disponibilites.creneau_id,
         creneaux.debut,
         creneaux.fin
    FROM disponibilites
    INNER JOIN creneaux
        ON disponibilites.creneau_id = creneaux.id
    WHERE disponibilites.travail_id = ?`;

    connexion.query(sql, [id], (erreur, resultats) => {

        if (erreur) {
            return res.status(500).json({
                err: ["Erreur lors de la récupération des disponibilités"]
            });
        }

        res.json(resultats)
    });
})

router.put("/:id", verifierJeton, (req, res) => {

    const id = req.params.id;

    const {
        titre,
        description,
        type,
        disponible,
        remise,
        ouvert
    } = req.body;

    //verification de l'existence du travail
    connexion.query(
        "SELECT id FROM travaux WHERE id = ?",
        [id],
        (err, travaux) => {
            if(err) {
                return res.status(500).json({
                    err:["Erreur serveur"]
                });
            }

            if(travaux.length === 0) {
                return.res.status(404).json({
                    err: ["Travail introuvable"]
                });
            }

            // Verification du travail appartenant au prof
            
            const sql = `
                SELECT travaux.id
                FROM travaux
                INNER JOIN cours ON travaux.cours_id = cours.id
                WHERE travauz.id = ?
                AND cours.utilisateur_id = ?
            `;

            connexion.query(
                sql,
                [id, req.utilisateurId],
                (err, resultat) => {
                    if(err) {
                        
                    }
                }
            )
        }
    )
})


module.exports = router;