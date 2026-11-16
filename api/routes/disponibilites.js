const express = require("express");
const router = express.Router();

const connexion = require("../connexion");

router.put("/:id/disponibilites/:matricule", (req, res) => {

    const id = req.params.id;
    const matricule = req.params.matricule;
    const nom = req.body.nom;
    const creneaux = req.body.creneaux;

    //vérification des données reçues

    if(
        typeof nom !== "string" ||
        nom.trim() === "" ||
        !Array.isArray(creneaux) ||
        creneaux.some(c => typeof c !== "string") ||
        new Set(creneaux).size !== creneaux.length
    ) {
        return res.status(400).json({
            err: ["Données invalides"]
        })
    }

    // Vérification de l'existence du travail

    connexion.query(
        "SELECT id FROM travaux WHERE id = ?",
        [id],
        (err, travaux) => {
            if(err) {
                return res.status(500).json({
                    err: ["Erreur serveur"]
                });
            }

            if(travaux.length === 0) {
                return res.status(404).json({
                    err: ["Travail introuvable"]
                });
            }

            // vérification des créneaux appartiennent bien au travail

            const verifCreneau = (callback) =>{
                if(creneaux.length === 0) {
                    return callback(null, []);
                }

                connexion.query(
                    "SELECT id FROM creneaux WHERE travail_id = ? AND id IN (?)",
                    [id, crenaux],
                    callback
                );
            };

            verifCreneau((err, resultats) => {
                if(err) {
                    return res.status(500).json({
                        err: ["Erreur lors de la vérification des créneaux"]
                    });
                }

                if(resultats.length !== creneaux.length) {
                    return res.status(400).json({
                        err: ["un ou plusieurs créneaux sont invalides"]
                    });
                }

                connexion.beginTransaction((err) => {

                    if (err) {
                        return res.status(500).json({
                            err: ["Erreur serveur"]
                        });
                    }

                    connexion.query(
                        "DELETE FROM disponibilites WHERE travail_id = ? AND matricule = ?",
                        [id, matricule],
                        (err) => {
                            if(err) {
                                return connexion.rollback(()=> {
                                    res.status(500).json({
                                        err: ["Erreur lors de la modification"]
                                    });
                                });
                            }

                            // préparation des nouvelles disponibilités

                            const val = creneaux.map(creneau => [
                                id,
                                creneau,
                                matricule,
                                nom.trim()
                            ]);

                            if(val.length === 0) {
                                return connexion.commit((err) => {
                                    if(err) {
                                        return connexion.rollback(() => {
                                            res.status(500).json({
                                                err: ["Erreur serveur"]
                                            });
                                        });
                                    }

                                    res.status(204).end();
                                });
                            }

                            connexion.query(
                                "INSERT INTO disponibilites (travail_id, creneau_id, matricule, nom) VALUES ?",
                                [val],
                                (err) => {
                                    if(err) {
                                        return connexion.rollback(() => {
                                            res.status(500).json({
                                                err: ["Erreur lors de l'enregistrement"]
                                            });
                                        });
                                    }

                                    connexion.commit((err) => {
                                        if(err) {
                                            return connexion.rollback(() => {
                                                res.status(500).json({
                                                    err: ["Erreur serveurs"]
                                                });
                                            });
                                        }

                                        res.status(204).end();
                                    });
                                }
                            );
                        }
                    );
                });
            });
        }
    );
});


module.exports = router;