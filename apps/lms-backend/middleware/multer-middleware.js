const multer = require("multer");
const { HTTP_STATUS_CODE } = require("../lib/constants");

const upload = multer({
  storage: multer.memoryStorage(),
});

exports.single = (req, res, next) => {
  upload.single("file")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR)
        .json({ error: "Invalid file." });
    }

    if (err) {
      return res
        .status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR)
        .json(err);
    }

    next();
  });
};

exports.multiple = (req, res, next) => {
  upload.array("files", 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR)
        .json({ error: "Invalid file." });
    }

    if (err) {
      return res
        .status(HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR)
        .json(err);
    }

    next();
  });
};