// ICI ON A UN ROUTER POUR LE PATH /api
const {Router} = require("express");

const qcmRoute = require("./QCM/qcm.js")



//login
function login(req, res) {
    if (!(req.body.username && req.body.password)) {
        return redirect('/')
    }

    var username = req.body.username
    var pwd = req.body.password
    var hashed = req.app.hash(req.body.password)

    user.objects.filter( { username:username, pwd:hashed } ).all(async function (err, dat) {
        if (dat == undefined || dat.length != 1) {
            res.redirect('/login')
            return
        }

        req.session.logged_in = true
        req.session.username = username
        req.session.userid = dat[0].id
        req.session.userdata = dat[0]
        var dat = await grouplinker.objects.filter( { userid:dat[0].id } ).asyncAll()
        req.session.permissions = dat.map(function call(x) {
            return x.$groupid.grpname
        })
        
        res.redirect('/')
    })
}

router.post("/login", login)

const router = Router();

router.use("/qcm", qcmRoute)

module.exports = router;