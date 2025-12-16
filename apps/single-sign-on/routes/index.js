const router = require("express").Router();
const { AthenticationController } = require('../controllers')

router.get('/', AthenticationController.getSession);
router.get('/login', AthenticationController.login);
router.post('/login', AthenticationController.doLogin);
router.get('/logout', AthenticationController.logout);
router.get("/password/forgot", AthenticationController.forgot);
router.post("/password/forgot", AthenticationController.doForgot);
router.get("/password/reset", AthenticationController.resetPassword);
router.post("/password/reset", AthenticationController.doResetPassword);

router.get('/logo',AthenticationController.getLogo );

module.exports = router;
