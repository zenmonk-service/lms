const multer = require('multer');
const path = require('path');
const { HTTP_STATUS_CODE } = require('../lib/constants');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'))
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: multerStorage })

exports.single = (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR).json({ error: "Invalid file." });
        } else if (err) {
            return res.status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR).json(err);
        }
        next();
    })
}

exports.multiple = (req, res, next) => {
    upload.array('files', 10)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR).json({ error: "Invalid file." });
        } else if (err) {
            console.log('Error occured while uplaoding a file: ', err);
            return res.status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR).json(err);
        }
        next();
    })
}