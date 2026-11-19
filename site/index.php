<?php include 'includes/header.php'; ?>

<div id="app">

    <h2>Bienvenue sur Dex</h2>

    <p>Choisissez un cours pour consulter les travaux disponibles.</p>

    <div v-if="chargement">
        Chargement des cours...
    </div>

    <div v-else-if="erreur">
        {{ erreur }}
    </div>

    <div v-else>
        <div v-for="cours in cours" :key="cours.id">

            <a :href="'travaux.php?cours=' + encodeURIComponent(cours.id)">

            <h3>{{ cours.titre }}</h3>

            <p>{{ cours.id }}</p>

            </a>

        </div>

    </div>

</div>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/index.js"></script>

<?php include 'includes/footer.php'; ?>