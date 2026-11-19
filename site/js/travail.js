
const element = document.querySelector("#app");

const travailId = element.dataset.travailId;

const app = Vue.createApp({

    data() {
        return {
            travail: null,
            creneaux: [],
            creneauxSelectionnes: [],
            matricule: "",
            nom: "",
            message: "",
            chargement: true,
            erreur: ""
        };
    },

    async mounted() {

        try {

            const resultats = await Promise.all([
                obtenirTravail(travailId),
                obtenirCreneaux(travailId)
            ]);

            this.travail = resultats[0];
            this.creneaux = resultats[1];

        } catch (erreur) {

            this.erreur = erreur.message;

        } finally {

            this.chargement = false;

        }
    },

    methods: {

        // Formater les dates
        formaterDate(date) {

            return new Date(date).toLocaleString("fr-CA", {
                dateStyle: "short",
                timeStyle: "short"
            });

        },

        // Enregistrer les disponibilités
        async enregistrerDisponibilites() {

            this.erreur = "";
            this.message = "";

            try {

                const reponse = await fetch(
                    API_URL + "/travaux/" +
                    encodeURIComponent(travailId) +
                    "/disponibilites/" +
                    encodeURIComponent(this.matricule),
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            nom: this.nom,
                            creneaux: this.creneauxSelectionnes
                        })
                    }
                );

                if (!reponse.ok) {

                    const donnees = await reponse.json();

                    throw new Error(
                        donnees.erreurs?.join(", ") ||
                        "Erreur lors de l'enregistrement"
                    );

                }

                this.message = "Disponibilités enregistrées avec succès !";

            } catch (erreur) {

                this.erreur = erreur.message;

            }

        }

    }

});

app.mount("#app");
