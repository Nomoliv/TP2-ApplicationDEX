<?php
http_response_code(404);

include 'includes/header.php';
?>

<div class="erreur-404">

    <h2>Page introuvable</h2>

    <p>Désolé, la page que vous recherchez n'existe pas.</p>

    <a href="index.php">Retour à l'accueil</a>

</div>

<?php include 'includes/footer.php'; ?>
