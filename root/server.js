//express related packages
const express = require('express')
const session = require('express-session')
const upload = require('express-fileupload')
const dbContainer = require('./database/db')
const db = new dbContainer.Database('db')

db.createModel("user", {
  username: new dbContainer.fields.CharField(100, []),
  pwd: new dbContainer.fields.CharField(100, []),
  email: new dbContainer.fields.CharField(100, [])
})

db.createModel("post", {
  fpath: new dbContainer.fields.CharField(100, []),
  userid: new dbContainer.fields.IntegerField([])
})

db.launchSql()

const app = express()
const port = 3000

//other packages
const fs = require('fs')

//for uploading files
app.use(upload())
app.db = db

//parse json? (check with Thimote75)
app.use(express.json());
app.use(express.urlencoded()); //i think this is deprecated tho

//setup template renderer (ejs)
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', (__dirname+'/ROUTES/VIEWS/TEMPLATES'));

//setup session
app.use(session({ secret: 'idk youre supposed to put a secret here', cookie: { maxAge:60*60*1000 }}))

// API
const views = require('./ROUTES/VIEWS/views.js');

//##############################################################
app.use(views)

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