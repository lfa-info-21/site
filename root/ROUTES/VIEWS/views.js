// ICI ON A UN ROUTER POUR LE PATH /api
const express = require("express");
const Router = express.Router
// const qcmRoute = require("./QCM/qcm.js")

const router = Router();

// QCM ROUTES

// router.use("/qcm", qcmRoute)

// ARTICLES

const mdRoute = require("./md/md.js");

router.use("/md", mdRoute);

// VIEWS

router.get('/', async function (req, res) {
    var paths = await req.app.db.models.post[3].objects.asyncAll()
  
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
  
router.get('/about', async function (req, res) {
    res.render('about.html', {"logged_in":req.session.logged_in})
})

router.get('/login/', (req, res) => {
    res.render('login.html', {})
})

router.get('/contact/', (req, res) => {
    res.render('contact.html', {})
})

router.get('/post/', (req, res) => {
    res.render('post.html', {})
})

//BOUGER VERS VIEWS static file serving
router.use(express.static('ROUTES/VIEWS/STATIC'))

module.exports = router;