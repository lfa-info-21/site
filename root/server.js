//express related packages
const express = require('express')
const session = require('express-session')
const upload = require('express-fileupload')
const app = express()
const port = 3000

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

//##############################################################



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

  res.render('index.html', {"logged_in":req.session.logged_in, "time_left":req.session.cookie.maxAge / 1000, "posts":posts})
})

app.get('/about', async function (req, res) {
  res.render('about.html', {"logged_in":req.session.logged_in})
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
app.get('/contact/', (req, res) => {
  res.render('contact.html', {})
})
app.get('/post/', (req, res) => {
  res.render('post.html', {})
})




//BOUGER VERS VIEWS static file serving
app.use(express.static('public'))

//run application
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


/* class Post{
  constructor (title, description, image, location){
    this.title =title
    this.description = description
    this.image = image
    this.location = location
  }
} */

/* app.use('/admin', admin.router)
app.use('/api', api.router)
app.use('/qcm', qcm.router) */