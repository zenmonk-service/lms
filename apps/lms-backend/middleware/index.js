module.exports = {
    authMiddleware: require('./auth-middleware'),
    errorMiddleware: require('./error-middleware'),
    error: require('./error'),
    multerMiddleware: require('./multer-middleware'),
    changeSchema :  require("./change-schema-middleware")
}