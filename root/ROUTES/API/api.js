// ICI ON A UN ROUTER POUR LE PATH /api
const {Router} = require("express");

const qcmRoute = require("./QCM/qcm.js")

const router = Router();

router.use("/qcm", qcmRoute)

module.exports = router;