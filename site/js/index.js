const app = Vue.createApp({

    data() {
        return {
            cours: [],
            chargement: true,
            erreur: ""
        };
    },

    async mounted() {

        try {
            this.cours = await obtenirCours();

        } catch (erreur) {
            this.erreur = erreur.message;

        } finally {
            this.chargement = false;
        }

    }

});

app.mount("#app");
