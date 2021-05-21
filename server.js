
//packages
const fs = require('fs')

// database
var sqlite3 = require('sqlite3')
var db = new sqlite3.Database(':memory:')
const model = require('./sql/model')
const user = new model.Model("utilisateur", db)

const crypto = require('crypto');

const SECRET_PWD_KEY = 'jfrokhfigqzujfDHFJCKSYLOTIR8IOLU'
function hash (secret) {
  return crypto.createHmac('sha256', secret)
    .update(SECRET_PWD_KEY)
    .digest('hex');
}

db.serialize(function () {
  db.run(fs.readFileSync('./sql/init/tables.sql', 'utf-8'))

  var stmt = db.prepare("INSERT INTO utilisateur VALUES (NULL, ?, 'none', ?, ?)")

  stmt.run("thimote", hash('pwd1'), 0)
  stmt.run("thimote2", hash('pwd0'), 1)
  
user.objects.update(0, { perm:3 })
})

// Permission Count
const perm_length = 1

// permissions
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

//express related packages
const express = require('express')
const session = require('express-session')
const upload = require('express-fileupload')
const app = express()
const port = 3000

//custom packages
const latexsys = require('./qcm/latex')
const qcmloader = require('./qcm/qcm')
const qcmcreator = require('./qcm/qcm-loader')
const qcmbrowser = require('./qcm/qcm-browser')

//packages for markdown rendering
const matter = require('gray-matter');
const md = require('markdown-it');

//for uploading files
app.use(upload())

//parse json? (check with Thimote75)
app.use(express.json());
app.use(express.urlencoded()); //i think this is deprecated tho

//setup template renderer (ejs)
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', (__dirname+'/public/templates'));

//setup session
app.use(session({ secret: 'idk youre supposed to put a secret here', cookie: { maxAge:60*60*1000 }}))

//##############################################################

//main page
app.get('/', (req, res) => {
  res.render('main.html', {"logged_in":req.session.logged_in, "time_left":req.session.cookie.maxAge / 1000})
})

//mardown view
app.get('/article/:name/', (req, res) => {
  var name = req.params.name
  if (!name.endsWith(".md")){
    name= name+".md"
  }

    // read the markdown file
    const file = matter.read(__dirname + '/public/articles/' + req.params.name + '.md');

    // use markdown-it to convert content to HTML
    markDownFile = md()
    let content = file.content;
    var result = markDownFile.render(content);
  
    res.render("article", {
      post: result,
      title: file.data.title,
      description: file.data.description,
      image: file.data.image
    });
})

//login page
app.post('/login/', (req, res) => {

  //check form data for passsword, if ok set session logged_in to true and redirect to root/home
  if(req.body.password && req.body.username){
    db.serialize(
      function() {
        user.objects.filter({ username:req.body.username, pwd:hash(req.body.password) }).all(function (err, all) {
          if (all == undefined || all.length == 0) {
            res.redirect('')
            return
          }
          console.log(all)
          req.session.logged_in = true
          req.session.username = req.body.username
          req.session.permission = all[0].perm

          res.redirect('/')
        })
      }
    )
  }

  //if the password is wrong reload the page
  else{
    res.redirect("")
  }
  
})

app.get('/login/', (req, res) => {
  // if logged in
  if (req.session.logged_in){
    res.redirect("/")
  }
  // if not logged in
  else{
    res.render('login.html')
  }
  
})

app.get('/logout/', (req, res) => {
  req.session.logged_in = false;
  res.redirect("/")
})

//########## QCM ##########

app.get('/qcm/create/', (req, res) => {
  if (!req.session.logged_in) {
    res.redirect('/')
    return
  }
  if (!permission(req.session.permission)[0]) {
    res.redirect('/')
    return
  }

  res.render("qcm/qcm-create.html")
})
app.get('/qcm/browse/', (req, res) => {
  var page = 0
  if (req.query.page) {
    page = Number(req.query.page)
    if (page < 0) {
      page = 0
    }
  }

  res.render("qcm/qcm-browser.html", {"qcms":qcmbrowser.browse(page), 'page':page, 'max_page':qcmbrowser.pageCount()})
}) 

app.post('/qcm/create', (req, res) => {
  if (!req.session.logged_in) {
    res.redirect('/')
    return
  }
  if (!permission(req.session.permission)[0]) {
    res.redirect('/')
    return
  }
  
  qcmcreator.createObject(req.files['file'], req.body.text)//not sure if right method

  var qcm = qcmloader.QCMBuilder.fromLatex(latexsys.LATEX_QCM1)//ok here we parse the latex
  qcm.shuffle() //here we shuffle the questions randomly

  res.render("qcm/qcm.html",{"qcm":qcm}) //SEND BAKK DAT BISH
}) 

app.get('/qcm/:qcm', (req, res) => {
    var qcm = qcmcreator.getObject(req.params.qcm)

    res.render("qcm/qcm.html",{"qcm":qcm})
})

//########## QCM END ##########

//static file serving
app.use(express.static('public'))

//run application
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})