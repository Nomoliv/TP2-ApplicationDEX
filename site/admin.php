<?php include 'includes/header.php'; ?>

<div id="app">

    <h2>Administration Dex</h2>

    <section v-if="!connecte">

        <h3>Connexion enseignant</h3>

        <form @submit.prevent="seConnecter">

            <div>
                <label for="identifiant">Identifiant</label>

                <input
                    type="text"
                    id="identifiant"
                    v-model="identifiant"
                    required
                >
            </div>

            <div>
                <label for="motDePasse">Mot de passe</label>

                <input
                    type="password"
                    id="motDePasse"
                    v-model="motDePasse"
                    required
                >
            </div>

            <button type="submit">
                Se connecter
            </button>

            <p v-if="erreur">{{ erreur }}</p>

        </form>

    </section>

    <section v-else>

        <h3>Bienvenue {{ utilisateur.nom }}</h3>

        <button @click="seDeconnecter">
            Déconnexion
        </button>

        <h3>Mes travaux</h3>

        <p v-if="chargement">
            Chargement des travaux...
        </p>

        <p v-if="erreur">
            {{ erreur }}
        </p>

        <p v-if="messageSucces">
            {{ messageSucces }}
        </p>

        <div v-for="travail in travaux" :key="travail.id">

            <hr>

            <h4>{{ travail.titre }}</h4>

            <p>{{ travail.description }}</p>

            <p>Identifiant : {{ travail.id }}</p>

            <p>Type : {{ travail.type }}</p>

            <p>
                État :
                {{ Number(travail.ouvert) === 1 ? 'Ouvert' : 'Fermé' }}
            </p>

            <button
                @click="changerOuverture(travail)"
                :disabled="modificationEnCours === travail.id"
            >
                {{
                    modificationEnCours === travail.id
                        ? 'Modification...'
                        : Number(travail.ouvert) === 1
                            ? 'Fermer le travail'
                            : 'Ouvrir le travail'
                }}
            </button>

        </div>

    </section>

</div>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/admin.js"></script>

<?php include 'includes/footer.php'; ?>
