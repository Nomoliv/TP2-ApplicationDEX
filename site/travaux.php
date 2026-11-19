<?php

$coursId = $_GET['cours'] ?? '';

if (
    !is_string($coursId) ||
    !preg_match('/^[A-Z0-9-]{1,30}$/', $coursId)
) {
    http_response_code(404);
    include '404.php';
    exit;
}

include 'includes/header.php';

?>

<div id="app" data-cours-id="<?= htmlspecialchars($coursId, ENT_QUOTES, 'UTF-8') ?>">

    <h2>Travaux du cours : <?= htmlspecialchars($coursId, ENT_QUOTES, 'UTF-8') ?></h2>

    <div v-if="chargement">
        Chargement des travaux...
    </div>

    <div v-else-if="erreur">
        {{ erreur }}
    </div>

    <div v-else-if="travaux.length === 0">
        Aucun travail disponible pour ce cours.
    </div>

    <div v-else>

        <div v-for="travail in travaux" :key="travail.id">

            <h3>{{ travail.titre }}</h3>

            <p>{{ travail.description }}</p>

            <p>Type : {{ travail.type }}</p>

            <p>Date de remise : {{ travail.remise }}</p>

            <a :href="'travail.php?travail=' + encodeURIComponent(travail.id)">
                Consulter le travail
            </a>

            <hr>

        </div>

    </div>

</div>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/travaux.js"></script>

<?php include 'includes/footer.php'; ?>
