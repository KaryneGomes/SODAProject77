require("dotenv").config();
const app = require("./app");
const db = require("./config/database");

const PORT = process.env.PORT || 3000;

db.sync({ alter: true })
  .then(() => {
    console.log("Banco sincronizado");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar com o banco:", error);
    process.exit(1);
  });