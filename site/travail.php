<?php

$travailId = $_GET['travail'] ?? '';

if (!preg_match('/^[a-z0-9-]{1,30}$/', $travailId)) {
    http_response_code(404);
    include '404.php';
    exit;
}

include 'includes/header.php';

?>

<div id="app" data-travail-id="<?= htmlspecialchars($travailId, ENT_QUOTES, 'UTF-8') ?>">

    <h2>Détails du travail</h2>

    <div v-if="chargement">
        Chargement du travail...
    </div>

    <div v-else-if="erreur">
        {{ erreur }}
    </div>

    
<div v-else>

    <h3>{{ travail.titre }}</h3>

    <p>{{ travail.description }}</p>

   <p>Type : {{ travail.type === 'equipe' ? 'Équipe' : 'Individuel' }}</p>

    <p>Date de disponibilité : {{ travail.disponible }}</p>

    <p>Date de remise : {{ travail.remise }}</p>

    <hr>

    <h3>Choisir vos disponibilités</h3>

    <div v-if="creneaux.length === 0">
        Aucun créneau disponible.
    </div>

    <div v-for="creneau in creneaux" :key="creneau.id">

        <label>
            <input
                type="checkbox"
                :value="creneau.id"
                v-model="creneauxSelectionnes"
            >

            {{ formaterDate(creneau.debut) }}
            -
            {{ formaterDate(creneau.fin) }}
        </label>

    </div>

    <hr>

    <form @submit.prevent="enregistrerDisponibilites">

        <div>
            <label for="matricule">Matricule</label>
            <input
                type="text"
                id="matricule"
                v-model="matricule"
                required
            >
        </div>

        <div>
            <label for="nom">Nom complet</label>
            <input
                type="text"
                id="nom"
                v-model="nom"
                required
            >
        </div>

        <button type="submit">
            Enregistrer mes disponibilités
        </button>

    </form>

    <p v-if="message">{{ message }}</p>
    <p v-if="erreur">{{ erreur }}</p>

</div>


</div>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/travail.js"></script>

<?php include 'includes/footer.php'; ?>
