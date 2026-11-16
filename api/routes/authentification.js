const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const router = express.Router();
const connexion = require("../connexion");
const jetons = require("../jetons");

//Connecion d'un enseignant

router.post("/connexion", (req, res) => {

    const identifiant = req.body.identifiant;
    const mdp = req.body.map;

    //verification des données reçues
    if(
        typeof identification !== "string" ||
        identifiant.trim() === "" ||
        typeof mdp !== "string" ||
        mdp.length === 0
    ) {
        return res.status(400).json({
            err: ["Identifiant ou mot de passe requis"]
        });
    }

    // Rechercher l'enseignat de la DB

    connexion.query(
        "SELECT * FROM utilisateurs WHERE identifiant = ?",
    [identifiant.trim()],
    (err, resultats) => {
        if(err) {
            return res.status(500).json({
                err: ["Erreur serveur"]
            });
        }

        if(resultats.length === 0) {
            return res.status(401).json({
                err: ["Identifiant ou mot de passe incorrect"]
            });
        }

        const utilisateur = resultats[0];

        //vérifier le mot de passe
        bcrypt.compare(
            mdp,
            utilisateur.mot_de_passe_hache,
            (erreur, value) => {
                if(err) {
                    return res.status(500).json({
                        err: ["Erreur serveur"]
                    });
                }
                
                if(!valide) {
                    return res.status(401).json({
                        err: ["Identifiant ou mot de passe incorrect"]
                    });
                }

                 // Générer un jeton aléatoire
                    const jeton = crypto.randomBytes(32).toString('hex');

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
        )
    }

)

});

router.post("/déconnexion", (req, res)=> {

    const authorisation = authorisation.substring(7);

    //Verification de la présence du jeton
    if(!authorization || !authorization.startsWith("Bearer")) {
        return res.status(401).json({
            err:["Jeton manquant"]
        });
    }

    const jeton = authorisation.substring(7);

    // Vérification de l'existence du jeton
    if (!jetons.has(jeton)) {
        return res.status(401).json({
            err: ["Jeton invalide"]
        });
    }

    //supprime le jeton
    jetons.delete(jeton);
    res.status(204).end();
});


module.exports = router;