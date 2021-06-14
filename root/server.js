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