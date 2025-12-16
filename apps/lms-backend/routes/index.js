const { MethodNotAllowedError } = require("../middleware/error");

const router = require("express").Router();

router.use((req, res, next) => {
    const hasHandler = router.stack.find(layer => layer.route && layer.route.path === req.path);
    if (hasHandler && !hasHandler.route.methods[req.method.toLowerCase()]) {
        next(new MethodNotAllowedError({ method: req.method, path: req.path }));
    } else {
        next();
    }
})

router.use('/organizations', require('./organization-route'));

router.use('/users', require('./user-route'));
router.use('/users', require('./user-leave-route'));

router.use('/leave-types', require('./leave-type-route'));
router.use('/roles', require('./role-route'));
router.use('/permissions', require('./permission-route'))

router.use('/leave-requests', require('./leave-request-route'))

module.exports = router;