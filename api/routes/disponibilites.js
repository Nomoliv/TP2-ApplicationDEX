const express = require("express");
const router = express.Router();

const connexion = require("../connexion");

// PUT : Ajouter ou modifier les disponibilités d'un étudiant
router.put("/:id/disponibilites/:matricule", (req, res) => {

    const id = req.params.id;
    const matricule = req.params.matricule;
    const corps = req.body || {};

    const nom = corps.nom;
    const creneaux = corps.creneaux;

    // Vérification des données reçues

    if (
        matricule.trim() === "" ||
        matricule.length > 20 ||
        typeof nom !== "string" ||
        nom.trim() === "" ||
        nom.trim().length > 100 ||
        !Array.isArray(creneaux) ||
        creneaux.some(c =>
            typeof c !== "string" ||
            c.trim() === "" ||
            c.length > 30
        ) ||
        new Set(creneaux).size !== creneaux.length
    ) {
        return res.status(400).json({
            erreurs: ["Données invalides"]
        });
    }

    // Vérifier si le travail existe

    connexion.query(
        "SELECT id FROM travaux WHERE id = ?",
        [id],
        (err, travaux) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur serveur"]
                });
            }

            if (travaux.length === 0) {
                return res.status(404).json({
                    erreurs: ["Travail introuvable"]
                });
            }

            // Vérifier que les créneaux appartiennent au travail

            const verifierCreneaux = (callback) => {

                if (creneaux.length === 0) {
                    return callback(null, []);
                }

                connexion.query(
                    "SELECT id FROM creneaux WHERE travail_id = ? AND id IN (?)",
                    [id, creneaux],
                    callback
                );
            };

            verifierCreneaux((err, resultats) => {

                if (err) {
                    return res.status(500).json({
                        erreurs: ["Erreur lors de la vérification des créneaux"]
                    });
                }

                if (resultats.length !== creneaux.length) {
                    return res.status(400).json({
                        erreurs: ["Un ou plusieurs créneaux sont invalides"]
                    });
                }

                // Commencer la transaction

                connexion.beginTransaction((err) => {

                    if (err) {
                        return res.status(500).json({
                            erreurs: ["Erreur serveur"]
                        });
                    }

                    // Supprimer les anciennes disponibilités

                    connexion.query(
                        "DELETE FROM disponibilites WHERE travail_id = ? AND matricule = ?",
                        [id, matricule],
                        (err) => {

                            if (err) {
                                return connexion.rollback(() => {
                                    res.status(500).json({
                                        erreurs: ["Erreur lors de la modification"]
                                    });
                                });
                            }

                            // Préparer les nouvelles disponibilités

                            const valeurs = creneaux.map(creneau => [
                                id,
                                creneau,
                                matricule,
                                nom.trim()
                            ]);

                            // Aucun créneau sélectionné

                            if (valeurs.length === 0) {

                                return connexion.commit((err) => {

                                    if (err) {
                                        return connexion.rollback(() => {
                                            res.status(500).json({
                                                erreurs: ["Erreur serveur"]
                                            });
                                        });
                                    }

                                    res.status(204).end();
                                });
                            }

                            // Enregistrer les nouvelles disponibilités

                            connexion.query(
                                "INSERT INTO disponibilites (travail_id, creneau_id, matricule, nom) VALUES ?",
                                [valeurs],
                                (err) => {

                                    if (err) {
                                        return connexion.rollback(() => {
                                            res.status(500).json({
                                                erreurs: ["Erreur lors de l'enregistrement"]
                                            });
                                        });
                                    }

                                    // Confirmer la transaction

                                    connexion.commit((err) => {

                                        if (err) {
                                            return connexion.rollback(() => {
                                                res.status(500).json({
                                                    erreurs: ["Erreur serveur"]
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
