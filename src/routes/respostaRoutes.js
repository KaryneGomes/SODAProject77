const router = require('express').Router();
const respostaController = require('../controllers/respostaController');
const auth = require('../midlleware/auth');
const permit = require('../midlleware/autorizacao');

router.post('/', auth, permit('admin'), respostaController.criarResposta);
router.get('/', auth, respostaController.listar);
router.get('/:id', auth, respostaController.buscar);
router.put('/:id', auth, respostaController.editar);
router.delete('/:id', auth, permit('admin'), respostaController.excluir);

module.exports = router;
