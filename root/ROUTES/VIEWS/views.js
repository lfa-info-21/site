// ICI ON A UN ROUTER POUR LE PATH /api
const {Router} = require("express");

const qcmRoute = require("./QCM/qcm.js")

const router = Router();

router.use("/qcm", qcmRoute)

module.exports = router;




router.get('/', async function (req, res) {
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