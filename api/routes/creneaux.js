const express = require("express");
const router = express.Router();

const connexion = require("../connexion");
const verifiJeton = require("../middleware/verifiJeton");

// Convertir une date pour MySQL
function dateMySQL(date) {
    return date.replace("T", " ") +
        (date.length === 16 ? ":00" : "");
}

// PUT : Modifier un créneau
router.put("/creneaux/:id", verifiJeton, (req, res) => {

    const id = req.params.id;
    const debut = req.body.debut;
    const fin = req.body.fin;

    // Vérifier si le créneau existe

    connexion.query(
        "SELECT id FROM creneaux WHERE id = ?",
        [id],
        (err, creneaux) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur serveur"]
                });
            }

            if (creneaux.length === 0) {
                return res.status(404).json({
                    erreurs: ["Créneau introuvable"]
                });
            }

            // Vérifier si le créneau appartient à l'enseignant

            const sql = `
                SELECT creneaux.id
                FROM creneaux
                INNER JOIN travaux
                    ON creneaux.travail_id = travaux.id
                INNER JOIN cours
                    ON travaux.cours_id = cours.id
                WHERE creneaux.id = ?
                AND cours.utilisateur_id = ?
            `;

            connexion.query(
                sql,
                [id, req.utilisateurId],
                (err, resultat) => {

                    if (err) {
                        return res.status(500).json({
                            erreurs: ["Erreur serveur"]
                        });
                    }

                    if (resultat.length === 0) {
                        return res.status(403).json({
                            erreurs: ["Accès interdit"]
                        });
                    }

                    // Vérifier les dates

                    const formatDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

                    if (
                        typeof debut !== "string" ||
                        typeof fin !== "string" ||
                        !formatDate.test(debut) ||
                        !formatDate.test(fin) ||
                        Number.isNaN(Date.parse(debut)) ||
                        Number.isNaN(Date.parse(fin)) ||
                        new Date(fin) <= new Date(debut)
                    ) {
                        return res.status(400).json({
                            erreurs: ["Dates invalides"]
                        });
                    }

                    // Modifier le créneau

                    connexion.query(
                        "UPDATE creneaux SET debut = ?, fin = ? WHERE id = ?",
                        [dateMySQL(debut), dateMySQL(fin), id],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    erreurs: ["Erreur lors de la modification"]
                                });
                            }

                            res.status(204).end();
                        }
                    );
                }
            );
        }
    );
});


// DELETE : Supprimer un créneau
router.delete("/creneaux/:id", verifiJeton, (req, res) => {

    const id = req.params.id;

    // Vérifier si le créneau existe

    connexion.query(
        "SELECT id FROM creneaux WHERE id = ?",
        [id],
        (err, creneaux) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur serveur"]
                });
            }

            if (creneaux.length === 0) {
                return res.status(404).json({
                    erreurs: ["Créneau introuvable"]
                });
            }

            // Vérifier si le créneau appartient à l'enseignant

            const sql = `
                SELECT creneaux.id
                FROM creneaux
                INNER JOIN travaux
                    ON creneaux.travail_id = travaux.id
                INNER JOIN cours
                    ON travaux.cours_id = cours.id
                WHERE creneaux.id = ?
                AND cours.utilisateur_id = ?
            `;

            connexion.query(
                sql,
                [id, req.utilisateurId],
                (err, resultat) => {

                    if (err) {
                        return res.status(500).json({
                            erreurs: ["Erreur serveur"]
                        });
                    }

                    if (resultat.length === 0) {
                        return res.status(403).json({
                            erreurs: ["Accès interdit"]
                        });
                    }

                    // Supprimer le créneau

                    connexion.query(
                        "DELETE FROM creneaux WHERE id = ?",
                        [id],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    erreurs: ["Erreur lors de la suppression"]
                                });
                            }

                            res.status(204).end();
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
