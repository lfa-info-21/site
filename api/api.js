var express = require('express')
var router = express.Router()
const fs = require('fs')

//qcm packages
const latexsys = require('../qcm/latex')
const qcmloader = require('../qcm/qcm')
const qcmcreator = require('../qcm/qcm-loader')
const qcmbrowser = require('../qcm/qcm-browser')

// database
var sqlite3 = require('sqlite3')
// Maybe move it from memory to ./db.sqlite3
var db = new sqlite3.Database(':memory:')
const model = require('./sql/model')
const user = new model.Model(
    "user", 
    [], 
    { id:"primkey", username:"string", pwd:"string", email:"string" },
    db
)
const post = new model.Model(
    "post", 
    [new model.ForeignKey("userid", user)], 
    { id:"primkey", userid:"int", fpath:"string" }, 
    db
)
const group = new model.Model(
    "permgroup", 
    [], 
    { id:"primkey", grpname:"string" }, 
    db
)
const grouplinker = new model.Model(
    "permlinker", 
    [
        new model.ForeignKey("userid", user),
        new model.ForeignKey("groupid", group)
    ],
    { id:"primkey", userid:"int", groupid:"int" }, 
    db
)
const crypto = require('crypto');

const SECRET_PWD_KEY = 'jfrokhfigqzujfDHFJCKSYLOTIR8IOLU'
function hash (secret) {
  return crypto.createHmac('sha256', secret)
    .update(SECRET_PWD_KEY)
    .digest('hex');
}

const GROUPS = [
    'admin',
    'createQCM'
]
function generateGroups () {
    group.objects.all(function (err, dat) {
        if (err)
            return
        
        dat = dat.map(function call(x) {return x.grpname})
        GROUPS.forEach(function call(grp) {
            if (!dat.includes(grp)) {
                group.objects.create( { grpname:grp } )
            }
        })
    })
}

db.serialize (function callback () {
    db.run(fs.readFileSync("./api/sql/init/user.sql", 'utf-8'))
    db.run(fs.readFileSync("./api/sql/init/post.sql", 'utf-8'))
    db.run(fs.readFileSync("./api/sql/init/permissions/group.sql", 'utf-8'))
    db.run(fs.readFileSync("./api/sql/init/permissions/grouplinker.sql", 'utf-8'))

    user.objects.create( {
        username: "thimote",
        pwd: hash("pwd0")
    } )
    user.objects.create( {
        username: "thimote2",
        pwd: hash("pwd1")
    } )

    post.objects.create( {
        fpath: 'name.md',
        userid: 1,
    })

    generateGroups()
    
    grouplinker.objects.create( { userid:1, groupid:1 } )
})

// QCM Api

class QcmApi {
    // Get Qcm
    get_qcm(req, res) {
        res.send(JSON.parse(fs.readFileSync(`./qcm/data/${req.params.qcm}.json`).toString('utf-8').split("\"status\":true").join("\"status\":false")))
    }
}
QCM_API = new QcmApi()

//login
function login(req, res) {
    if (!(req.body.username && req.body.password)) {
        return redirect('/')
    }

    var username = req.body.username
    var pwd = req.body.password
    var hashed = hash(req.body.password)

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

//logout
function logout(req, res) {
    req.session.logged_in = false
    res.redirect('/')
}

function createQCM (req, res) {
    if (!req.session.logged_in) {
      res.redirect('/')
      return
    }
    if (!req.session.permissions.includes('admin') && !req.session.permissions.includes('createQCM')) {
      res.redirect('/')
      return
    }
    
    qcmcreator.createObject(req.files['file'], req.body.name, req.session.username)//not sure if right method
  
    var qcm = qcmloader.QCMBuilder.fromLatex(latexsys.LATEX_QCM1) //ok here we parse the latex
    qcm.shuffle() //here we shuffle the questions randomly
  
    res.redirect(`/qcm/${qcm.uuid}`)
}

//define all the routes and methods for devs
const api_routes = [
    {
        "name":"login",
        "path":"/login",
        "METHOD":"POST",
        "func":login,
        "desc":"login to an account",
        "params":{
            'username':'the username of the account',
            'password':'the password of the account'
        }
    },
    {
        "name":"logout",
        "path":"/logout",
        "METHOD":"GET",
        "func":logout,
        "desc":"logout from an account",
        "params":{}
    },
    {
        "name":"createQCM",
        "path":"/qcm/create",
        "METHOD":"POST",
        "func":createQCM,
        "desc":"create a QCM, needs admin or createQCM permissions",
        "params":{
            "FILE:file":"The latex file given for the QCM",
            "name":"Name of the QCM",
        }
    },
    {
        "namme":"QCM.get",
        "path":"/qcm/:qcm",
        "METHOD":"GET",
        "func":QCM_API.get_qcm,
        "desc":"gets the qcm from an id",
        "params":{
            "URL:qcm":"Qcm Id"
        }
    }
]

// Base API Route (all api functions)
router.get('/', function (req, res) {
    req.session.perm_lvl = 
    res.render('api/all.html', { routes:api_routes })
})

// For Each API Route, generate a route for router with the path 
// (route.path) and the function (route.func)
// it will be bound to the post method if route.METHOD is POST
// Otherwise to get method
api_routes.forEach((route) => {
    if (route.METHOD == "POST") {
        router.post(route.path, route.func)
    } else {
        router.get(route.path, route.func)
    }
})

module.exports = {
    router: router,
    db: db,
    post: post,
    user: user,
}