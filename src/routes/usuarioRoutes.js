const router = require('express').Router();

const usuarioController = require('../controllers/usuarioController');

const auth = require('../midlleware/auth');

const permit = require('../midlleware/autorizacao');


// ===============================
// CADASTRO
// ===============================

router.post(
    '/cadastro',
    usuarioController.cadastrar
);


// ===============================
// LOGIN
// ===============================

router.post(
    '/login',
    usuarioController.login
);


// ===============================
// LISTAR USUÁRIOS
// Apenas admin
// ===============================

router.get(
    '/',
    auth,
    permit('admin'),
    usuarioController.listar
);


// ===============================
// BUSCAR USUÁRIO
// ===============================

router.get(
    '/:id',
    auth,
    usuarioController.buscar
);


// ===============================
// EDITAR USUÁRIO
// ===============================

router.put(
    '/:id',
    auth,
    usuarioController.editar
);


// ===============================
// EXCLUIR USUÁRIO
// Apenas admin
// ===============================

router.delete(
    '/:id',
    auth,
    permit('admin'),
    usuarioController.excluir
);


module.exports = router;