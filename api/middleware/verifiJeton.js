
const jetons = require("../jetons");

function verifiJeton(req, res, next) {

    const authorization = req.headers.authorization;

    // Vérifier la présence du jeton
    if (
        typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            erreurs: ["Jeton manquant"]
        });
    }

    // Récupérer le jeton
    const jeton = authorization.substring(7);

    // Vérifier l'existence du jeton
    if (!jetons.has(jeton)) {
        return res.status(401).json({
            erreurs: ["Jeton invalide"]
        });
    }

    // Récupérer l'identifiant de l'enseignant
    req.utilisateurId = jetons.get(jeton);

    // Autoriser l'accès à la prochaine fonction
    next();
}

module.exports = verifiJeton;
