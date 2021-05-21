var express = require('express')
var router = express.Router()
const fs = require('fs')

// database
var sqlite3 = require('sqlite3')
var db = new sqlite3.Database(':memory:')
const model = require('./sql/model')
const user = new model.Model("user", db)
const post = new model.Model("post", db)
const crypto = require('crypto');

const SECRET_PWD_KEY = 'jfrokhfigqzujfDHFJCKSYLOTIR8IOLU'
function hash (secret) {
  return crypto.createHmac('sha256', secret)
    .update(SECRET_PWD_KEY)
    .digest('hex');
}

db.serialize (function callback () {
    db.run(fs.readFileSync("./api/sql/init/user.sql", 'utf-8'))
    db.run(fs.readFileSync("./api/sql/init/post.sql", 'utf-8'))

    user.objects.create( {
        username: "thimote",
        pwd: hash("pwd0"),
        perm: 0,
    } )

    post.objects.create( {
        fpath: 'name.md',
        userid: 1,
    })
})

// Permission Count
const perm_length = 2

// permissions
// [isAdmin, canCreateQCM]
function permissionVal (arr) {
  var v = 0
  var d = 1
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      v += d
    }

    d *= 2
  }

  return v
}

function permission (val) {
  var arr = []
  var d = Math.pow(2, perm_length - 1)
  for (var i = perm_length - 1; i >= 0; i --) {
    if ((val % d) != val) {
      val = val % d
      arr.push(true)
    } else {
      arr.push(false)
    }
    d /= 2
  }
  return arr.reverse()
}



//login
function login(req, res) {
    if (!(req.body.username && req.body.password)) {
        return redirect('/')
    }

    var username = req.body.username
    var pwd = req.body.password
    var hashed = hash(req.body.password)

    console.log(hashed)

    user.objects.filter( { username:username, pwd:hashed } ).all(function (err, dat) {
        if (dat == undefined || dat.length != 1) {
            res.redirect('/login')
            return
        }

        req.session.logged_in = true
        req.session.perm_lvl = permission(dat[0])
        req.session.username = username
        
        res.redirect('/')
    })
}

//logout
function logout(req, res) {
    req.session.logged_in = false
    res.redirect('/')
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