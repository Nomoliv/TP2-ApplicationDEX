const app = Vue.createApp({

    data() {
        return {
            identifiant: "",
            motDePasse: "",
            connecte: false,
            utilisateur: null,
            jeton: "",
            travaux: [],
            erreur: "",
            messageSucces: "",
            chargement: false,
            modificationEnCours: null
        };
    },

    async mounted() {

        // Vérifier si un enseignant est déjà connecté
        this.jeton = sessionStorage.getItem("jeton") || "";

        const utilisateurStocke =
            sessionStorage.getItem("utilisateur");

        if (this.jeton && utilisateurStocke) {

            try {

                this.utilisateur = JSON.parse(utilisateurStocke);
                this.connecte = true;

                await this.chargerTravaux();

            } catch (erreur) {

                sessionStorage.removeItem("jeton");
                sessionStorage.removeItem("utilisateur");

                this.connecte = false;
                this.utilisateur = null;
                this.jeton = "";
            }
        }
    },

    methods: {

        // Connexion de l'enseignant
        async seConnecter() {

            this.erreur = "";
            this.messageSucces = "";

            try {

                const reponse = await fetch(API_URL + "/connexion", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        identifiant: this.identifiant,
                        motDePasse: this.motDePasse
                    })
                });

                const donnees = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        donnees.erreurs?.join(", ") ||
                        "Erreur de connexion"
                    );
                }

                // Enregistrer le jeton
                this.jeton = donnees.jeton;
                this.utilisateur = donnees.utilisateur;

                sessionStorage.setItem("jeton", this.jeton);

                sessionStorage.setItem(
                    "utilisateur",
                    JSON.stringify(this.utilisateur)
                );

                this.connecte = true;
                this.motDePasse = "";

                await this.chargerTravaux();

            } catch (erreur) {

                this.erreur = erreur.message;
            }
        },

        // Récupérer les travaux de l'enseignant
        async chargerTravaux() {

            this.chargement = true;
            this.erreur = "";

            try {

                const reponse = await fetch(
                    API_URL + "/admin/travaux",
                    {
                        headers: {
                            "Authorization": "Bearer " + this.jeton
                        }
                    }
                );

                const donnees = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        donnees.erreurs?.join(", ") ||
                        "Erreur lors du chargement des travaux"
                    );
                }

                this.travaux = donnees;

            } catch (erreur) {

                this.erreur = erreur.message;

                if (this.erreur.includes("Jeton")) {

                    sessionStorage.removeItem("jeton");
                    sessionStorage.removeItem("utilisateur");

                    this.connecte = false;
                    this.utilisateur = null;
                    this.jeton = "";
                }

            } finally {

                this.chargement = false;
            }
        },

        // Ouvrir ou fermer un travail
        async changerOuverture(travail) {

            this.erreur = "";
            this.messageSucces = "";

            this.modificationEnCours = travail.id;

            const nouveauStatut =
                Number(travail.ouvert) !== 1;

            try {

                const reponse = await fetch(
                    API_URL + "/travaux/" +
                    encodeURIComponent(travail.id) +
                    "/ouverture",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + this.jeton
                        },

                        body: JSON.stringify({
                            ouvert: nouveauStatut
                        })
                    }
                );

                const donnees = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        donnees.erreurs?.join(", ") ||
                        "Erreur lors de la modification"
                    );
                }

                // Actualiser le statut à l'écran
                travail.ouvert = donnees.ouvert;

                this.messageSucces = donnees.message;

            } catch (erreur) {

                this.erreur = erreur.message;

            } finally {

                this.modificationEnCours = null;
            }
        },

        // Déconnexion
        async seDeconnecter() {

            try {

                await fetch(API_URL + "/deconnexion", {
                    method: "POST",

                    headers: {
                        "Authorization": "Bearer " + this.jeton
                    }
                });

            } catch (erreur) {

                console.log("Erreur de déconnexion :", erreur);
            }

            sessionStorage.removeItem("jeton");
            sessionStorage.removeItem("utilisateur");

            this.connecte = false;
            this.utilisateur = null;
            this.jeton = "";
            this.travaux = [];
            this.erreur = "";
            this.messageSucces = "";
        }

    }

});

app.mount("#app");
