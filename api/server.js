const express = require("express");
const cors = require("cors");
const app = express();
const cours = require("./routes/cours");
const travaux = require("./routes/travaux");
const disponibilites = require("./routes/disponibilites");
const authentification = require("./routes/authentification");
const admin = require("./routes/admin");


app.use(cors());
app.use(express.json());
app.use("/api/cours", cours);
app.use("/api/travaux", travaux);
app.use("/api/travaux", disponibilites);
app.use("/api", authentification);
app.use("/api/admin", admin);

app.get("/api", (req, res) => {
    res.json({message: "L'api marche!"});
});

app.listen(3000, () => {
    console.log("serveur démaré sur le port 3000");
});