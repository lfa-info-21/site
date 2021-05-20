
//packages
const fs = require('fs')

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

//login page
app.post('/login/', (req, res) => {

  //check form data for passsword, if ok set session logged_in to true and redirect to root/home
  if(req.body.password && req.body.password=="jeanjacques"){

    req.session.logged_in = true;
    res.redirect("/")

  }

  //if the password is wrong reload the page
  else{
    res.redirect("")
  }
  
})

app.get('/login/', (req, res) => {
  //if logged in
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