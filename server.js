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

//other packages
const fs = require('fs')

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

// API
const api = require('./api/api')
const { path } = require('osenv')

//##############################################################

class Post{
  constructor (title, description, image, location){
    this.title =title
    this.description = description
    this.image = image
    this.location = location
  }
}

//main page
app.get('/', async function (req, res) {
  var paths = await api.post.objects.asyncAll()

  var posts = []

  paths.forEach((itempath) => {

    globalpath = __dirname + '/public/articles/' + itempath.fpath

    if (fs.existsSync(globalpath)){
      var item = matter.read(globalpath);
      posts.push({"title":item.data.title, "description":item.data.description, "image":item.data.image})
    }
    
  })

  res.render('main.html', {"logged_in":req.session.logged_in, "time_left":req.session.cookie.maxAge / 1000, "posts":posts})
})

//mardown view
app.get('/md/:name/', (req, res) => {
  var name = req.params.name
  if (!name.endsWith(".md")){
    name= name+".md"
  }

    // read the markdown file
    const file = matter.read(__dirname + '/public/articles/' + name);

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

app.get('/login/', (req, res) => {
  res.render('login.html', {})
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
  if (!permission(req.session.permission)[0]
    && !permission(req.session.permission)[1]) {
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

app.use('/api', api.router)

//########## QCM END ##########

//static file serving
app.use(express.static('public'))

//run application
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})