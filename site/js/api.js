async function appelerAPI(url) {

    const reponse = await fetch(API_URL + url);

    if (!reponse.ok) {
        const donnees = await reponse.json();

        throw new Error(
            donnees.erreurs?.join(", ") || "Erreur de communication avec l'API"
        );
    }

    return await reponse.json();
}

// Récupérer les cours
async function obtenirCours() {
    return await appelerAPI("/cours");
}

// Récupérer les travaux ouverts
async function obtenirTravaux(coursId = "") {

    let url = "/travaux";

    if (coursId) {
        url += "?cours=" + encodeURIComponent(coursId);
    }

    return await appelerAPI(url);
}

// Récupérer un travail précis
async function obtenirTravail(id) {
    return await appelerAPI("/travaux/" + encodeURIComponent(id));
}

// Récupérer les créneaux d'un travail
async function obtenirCreneaux(travailId) {

    return await appelerAPI(
        "/travaux/" + encodeURIComponent(travailId) + "/creneaux"
    );

}