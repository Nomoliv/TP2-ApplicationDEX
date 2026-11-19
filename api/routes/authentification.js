const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const router = express.Router();

const connexion = require("../connexion");
const jetons = require("../jetons");

// POST : Connexion d'un enseignant

router.post("/connexion", (req, res) => {

    const identifiant = req.body?.identifiant;
    const motDePasse = req.body?.motDePasse;

    // Vérification des données reçues

    if (
        typeof identifiant !== "string" ||
        identifiant.trim() === "" ||
        typeof motDePasse !== "string" ||
        motDePasse.length === 0
    ) {
        return res.status(400).json({
            erreurs: ["Identifiant ou mot de passe requis"]
        });
    }

    // Rechercher l'enseignant dans la base de données

    connexion.query(
        "SELECT * FROM utilisateurs WHERE identifiant = ?",
        [identifiant.trim()],
        (err, resultats) => {

            if (err) {
                return res.status(500).json({
                    erreurs: ["Erreur serveur"]
                });
            }

            if (resultats.length === 0) {
                return res.status(401).json({
                    erreurs: ["Identifiant ou mot de passe incorrect"]
                });
            }

            const utilisateur = resultats[0];

            // Vérifier le mot de passe

            bcrypt.compare(
                motDePasse,
                utilisateur.mot_de_passe_hache,
                (err, valide) => {

                    if (err) {
                        return res.status(500).json({
                            erreurs: ["Erreur serveur"]
                        });
                    }

                    if (!valide) {
                        return res.status(401).json({
                            erreurs: ["Identifiant ou mot de passe incorrect"]
                        });
                    }

                    // Générer un jeton aléatoire

                    const jeton = crypto.randomBytes(32).toString("hex");

                    jetons.set(jeton, utilisateur.id);

                    // Envoyer les informations de connexion

                    res.json({
                        jeton: jeton,
                        utilisateur: {
                            id: utilisateur.id,
                            nom: utilisateur.nom,
                            identifiant: utilisateur.identifiant
                        }
                    });

                }
            );
        }
    );
});


// POST : Déconnexion d'un enseignant

router.post("/deconnexion", (req, res) => {

    const autorisation = req.headers.authorization;

    // Vérifier la présence du jeton

    if (!autorisation || !autorisation.startsWith("Bearer ")) {
        return res.status(401).json({
            erreurs: ["Jeton manquant"]
        });
    }

    // Récupérer le jeton

    const jeton = autorisation.substring(7);

    // Vérifier l'existence du jeton

    if (!jetons.has(jeton)) {
        return res.status(401).json({
            erreurs: ["Jeton invalide"]
        });
    }

    // Supprimer le jeton

    jetons.delete(jeton);

    res.status(204).end();
});


module.exports = router;
