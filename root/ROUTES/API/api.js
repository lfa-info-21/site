// ICI ON A UN ROUTER POUR LE PATH /api
const { Router } = require("express");
var router = Router()

const crypto = require('crypto');

const fs = require("fs")

const latexsys = require('./QCM/latex.js')
const qcmloader = require('./QCM/qcm.js')
const qcmcreator = require('./QCM/qcm-loader.js')
const qcmbrowser = require('./QCM/qcm-browser.js')

class QcmApi {
    // Get Qcm
    get_qcm(req, res) {
        res.send( // Send following JSON data
            JSON.parse( // Parse the following data to JSON
                fs.readFileSync(`./qcm-data/${req.params.qcm}.json`) // Read File
                    .toString('utf-8') // Transform Buffer into String
                    .split("\"status\":true") // Remove status that are true
                    .join("\"status\":false") // Replace them by false statuses
            )
        )
    }
    // Create QCM
    create_qcm(req, res) {
        if (!req.session.logged_in) {
            res.redirect('/')
            return
        }
        if (!req.session.permissions.includes('admin') && !req.session.permissions.includes('createQCM')) {
            res.redirect('/')
            return
        }

        let cat_arr = ["Mathématique", "Informatique", "Autre"]
        let categoryId = cat_arr.indexOf(req.body.category)
        let category = cat_arr[Math.max(0, categoryId)]

        qcmcreator.createObject(req.files['file'], req.body.name, req.session.username, category)//not sure if right method

        var qcm = qcmloader.QCMBuilder.fromLatex(latexsys.LATEX_QCM1) //ok here we parse the latex
        qcm.shuffle() //here we shuffle the questions randomly

        res.redirect(`/qcm/${qcm.uuid}`)
    }
}
QCM_API = new QcmApi()

//login
function login(req, res) {
    if (!(req.body.username && req.body.password)) {
        return redirect('/')
    }
    let db = req.app.db;

    var username = req.body.username
    var pwd = req.body.password
    var hashed = req.app.hash(req.body.password)

    db.user.objects.filter({ username: username, pwd: hashed }).all(async function (err, dat) {
        if (dat == undefined || dat.length != 1) {
            res.redirect('/login')
            return
        }

        req.session.logged_in = true
        req.session.username = username
        req.session.userid = dat[0].id
        req.session.userdata = dat[0]
        var dat = await db.grouplinker.objects.filter({ userid: dat[0].id }).asyncAll()
        req.session.permissions = dat.map(function call(x) {
            return x?.$grpid?.grpname
        })

        res.redirect('/')
    })
}

function signup (req, res) {
    if (!(req.body.username && req.body.password)) {
        res.send(JSON.stringify({ "created":false, "global_err":"Missing username or password" }))
        return ;
    }

    const username = req.body.username
    const password = req.body.password
    const passhash = req.app.hash(password)

    if (username.length < 5 || password.length < 8) {
        res.send(JSON.stringify({ "created":false, "global_err":"The password or the username is too short" }))
        return ;
    }

    let db = req.app.db;
    db.user.objects.filter({ username: username }).all(async function (err, dat) {
        if (!(dat == undefined || dat.length != 1)) {
            res.send(JSON.stringify({ "created":false, "user_err":"Username already exists" }))
            return
        }

        db.db.serialize( function call() {

        db.user.objects.create( {
            username: username,
            pwd: passhash
        } )

        db.user.objects.filter({ username: username, pwd: passhash }).all(async function (err, dat) {
            req.session.logged_in = true
            req.session.username = username
            req.session.userid = dat[0].id
            req.session.userdata = dat[0]
            req.session.permissions = []

            res.send(JSON.stringify({ "created":true }))
        })

        })
    })
}

router.post("/login", login)
router.post("/signup", signup)
router.post("/qcm/create", QCM_API.create_qcm)
router.get("/qcm/:qcm", QCM_API.get_qcm)

// router.use("/qcm", qcmRoute)

module.exports = {
    router: router
};