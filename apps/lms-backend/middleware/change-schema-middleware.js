const { setSchema } = require("../lib/schema");


exports.changeSchema = async (req, res, next) => {
 const uuid = req.headers['org_uuid'];
 if(uuid){
     setSchema(uuid);
 }
 next()
};
