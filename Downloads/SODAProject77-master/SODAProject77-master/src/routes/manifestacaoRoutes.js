const router = require("express").Router();
const manifestacaoController = require("../controllers/manifestacaoController");
const auth = require("../midlleware/auth");

router.post("/", auth, manifestacaoController.criar);
router.get("/", manifestacaoController.listar);
router.get("/:id", manifestacaoController.buscar);
router.put("/:id", auth, manifestacaoController.editar);
router.delete("/:id", auth, manifestacaoController.excluir);

module.exports = router;