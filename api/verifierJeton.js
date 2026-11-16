const jetons = require("../jetons");

function verifierJeton(req, res, next) {

    const authorisation = req.headers.authorisation;
    
    //vérifier la présence du jeton
    if(!authorisation || !authorisation.startsWith("Bearer")) {
        return res.status(401).json({
            err: ["Jeton manquant"]
        });
    }

    //Récupérer le jeton
    const jeton = authorisation.substring(7);

    //Verification de l'existence du jeton
    if(!jetons.has(jeton)) {
        return res.status(401).json({
            err: ["Jeton invalide"]
        })
    }

    //recupération de l'identifiant de l'enseignant
    req.utilisateurId = jetons.get(jeton);

    next();
}

module.exports = verifierJeton;
