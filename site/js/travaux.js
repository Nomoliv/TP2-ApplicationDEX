const element = document.querySelector("#app");

const coursId = element.dataset.coursId;

const app = Vue.createApp({

    data() {
        return {
            coursId: coursId,
            travaux: [],
            chargement: true,
            erreur: ""
        };
    },

    async mounted() {

        try {

            this.travaux = await obtenirTravaux(this.coursId);

        } catch (erreur) {

            this.erreur = erreur.message;

        } finally {

            this.chargement = false;

        }

    }

});

app.mount("#app");
