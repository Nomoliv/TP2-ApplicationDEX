const express = require("express");
const router = express.Router();

const verifiJeton = require("../middleware/verifiJeton");
const connexion = require("../connexion");

// Vérifier une date
function dateValide(date) {
    return (
        typeof date === "string" &&
        !Number.isNaN(Date.parse(date))
    );
}

// Convertir une date pour MySQL
function dateMySQL(date) {
    return date.replace("T", " ").length === 16
        ? date.replace("T", " ") + ":00"
        : date.replace("T", " ");
}

// GET : Récupérer les travaux ouverts
router.get("/", (req, res) => {

    const cours = req.query.cours;

    let sql = "SELECT * FROM travaux WHERE ouvert = TRUE";
    let valeurs = [];

    if (cours) {
        sql += " AND cours_id = ?";
        valeurs.push(cours);
    }

    connexion.query(sql, valeurs, (err, resultats) => {

        if (err) {
            console.log("Erreur SQL :", err.message);

            return res.status(500).json({
                erreurs: ["Erreur lors de la récupération des travaux"]
            });
        }

        res.json(resultats);
    });
});


// GET : Récupérer un travail précis
router.get("/:id", (req, res) => {

    const id = req.params.id;

    connexion.query(
        "SELECT * FROM travaux WHERE id = ?",
        [id],
        (err, resultats) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur lors de la récupération du travail"]
                });
            }

            if (resultats.length === 0) {
                return res.status(404).json({
                    erreurs: ["Travail introuvable"]
                });
            }

            res.json(resultats[0]);
        }
    );
});


// GET : Récupérer les disponibilités d'un travail
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
        WHERE disponibilites.travail_id = ?
    `;

    connexion.query(sql, [id], (err, resultats) => {

        if (err) {
            return res.status(500).json({
                erreurs: ["Erreur lors de la récupération des disponibilités"]
            });
        }

        res.json(resultats);
    });
});


// PUT : Modifier un travail
router.put("/:id", verifiJeton, (req, res) => {

    const id = req.params.id;

    const {
        titre,
        description,
        type,
        disponible,
        remise,
        ouvert
    } = req.body;

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

            // Vérifier si le travail appartient à l'enseignant
            const sql = `
                SELECT travaux.id
                FROM travaux
                INNER JOIN cours
                    ON travaux.cours_id = cours.id
                WHERE travaux.id = ?
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

                    // Vérifier les données
                    if (
                        typeof titre !== "string" ||
                        titre.trim() === "" ||
                        titre.trim().length > 150 ||
                        typeof description !== "string" ||
                        description.trim() === "" ||
                        !["individuel", "equipe"].includes(type) ||
                        !dateValide(disponible) ||
                        !/^\d{4}-\d{2}-\d{2}$/.test(disponible) ||
                        !dateValide(remise) ||
                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(remise) ||
                        remise <= disponible + "T00:00" ||
                        typeof ouvert !== "boolean"
                    ) {
                        return res.status(400).json({
                            erreurs: ["Données invalides"]
                        });
                    }

                    // Modifier le travail
                    const sqlUpdate = `
                        UPDATE travaux
                        SET titre = ?,
                            description = ?,
                            type = ?,
                            disponible = ?,
                            remise = ?,
                            ouvert = ?
                        WHERE id = ?
                    `;

                    connexion.query(
                        sqlUpdate,
                        [
                            titre.trim(),
                            description.trim(),
                            type,
                            disponible,
                            dateMySQL(remise),
                            ouvert,
                            id
                        ],
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


// POST : Ajouter un créneau
router.post("/:id/creneaux", verifiJeton, (req, res) => {

    const id = req.params.id;
    const debut = req.body.debut;
    const fin = req.body.fin;

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

            // Vérifier si le travail appartient à l'enseignant
            const sql = `
                SELECT travaux.id
                FROM travaux
                INNER JOIN cours
                    ON travaux.cours_id = cours.id
                WHERE travaux.id = ?
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
                    if (
                        !dateValide(debut) ||
                        !dateValide(fin) ||
                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(debut) ||
                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(fin) ||
                        fin <= debut
                    ) {
                        return res.status(400).json({
                            erreurs: ["Dates invalides"]
                        });
                    }

                    // Récupérer les créneaux existants
                    connexion.query(
                        "SELECT id FROM creneaux WHERE travail_id = ?",
                        [id],
                        (err, creneaux) => {

                            if (err) {
                                return res.status(500).json({
                                    erreurs: ["Erreur serveur"]
                                });
                            }

                            // Générer le nouvel identifiant
                            const prefixe = id + "-";
                            let numeroMax = 0;

                            creneaux.forEach(creneau => {

                                if (creneau.id.startsWith(prefixe)) {

                                    const numero = Number(
                                        creneau.id.substring(prefixe.length)
                                    );

                                    if (Number.isInteger(numero)) {
                                        numeroMax = Math.max(numeroMax, numero);
                                    }
                                }
                            });

                            const nouveauId = prefixe +
                                String(numeroMax + 1).padStart(2, "0");

                            // Enregistrer le créneau
                            connexion.query(
                                `INSERT INTO creneaux
                                (id, travail_id, debut, fin)
                                VALUES (?, ?, ?, ?)`,
                                [
                                    nouveauId,
                                    id,
                                    dateMySQL(debut),
                                    dateMySQL(fin)
                                ],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json({
                                            erreurs: ["Erreur lors de la création du créneau"]
                                        });
                                    }

                                    res.status(201).json({
                                        id: nouveauId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// GET : Récupérer les créneaux d'un travail

router.get("/:id/creneaux", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT id, debut, fin
        FROM creneaux
        WHERE travail_id = ?
        ORDER BY debut
    `;

    connexion.query(sql, [id], (err, resultats) => {

        if (err) {
            console.log("Erreur SQL :", err.message);

            return res.status(500).json({
                erreurs: ["Erreur lors de la récupération des créneaux"]
            });
        }

        res.json(resultats);

    });

});


 // PATCH : Ouvrir ou fermer un travail

router.patch("/:id/ouverture", verifiJeton, (req, res) => {

    const id = req.params.id;
    const ouvert = req.body.ouvert;

    // Vérifier les données reçues
    if (typeof ouvert !== "boolean") {
        return res.status(400).json({
            erreurs: ["Statut invalide"]
        });
    }

    // Vérifier que le travail appartient à l'enseignant
    const sql = `
        SELECT travaux.id
        FROM travaux
        INNER JOIN cours
            ON travaux.cours_id = cours.id
        WHERE travaux.id = ?
        AND cours.utilisateur_id = ?
    `;

    connexion.query(
        sql,
        [id, req.utilisateurId],
        (err, resultats) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur serveur"]
                });
            }

            if (resultats.length === 0) {
                return res.status(404).json({
                    erreurs: ["Travail introuvable ou accès interdit"]
                });
            }

            // Modifier le statut du travail
            connexion.query(
                "UPDATE travaux SET ouvert = ? WHERE id = ?",
                [ouvert, id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            erreurs: ["Erreur lors de la modification du statut"]
                        });
                    }

                    res.json({
                        message: ouvert
                            ? "Travail ouvert avec succès"
                            : "Travail fermé avec succès",
                        ouvert: ouvert
                    });

                }
            );

        }
    );

});


module.exports = router;
