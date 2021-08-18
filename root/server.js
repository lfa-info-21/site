
Array.prototype.shuffle = function (seed=0) {
  var j, x, i;
  for (i = this.length - 1; i > 0; i--) {
    j = Math.floor((Math.random() * (i + 1) + seed) % (i + 1));
    x = this[i];
    this[i] = this[j];
    this[j] = x;
  }
}

String.prototype.smooth = function () {
  if (this == "") {
    return ""
  }
  var bi = 0;
  var ei = this.length - 1;

  while (bi < this.length && this[bi] == ' ') {
    bi += 1
  }
  while (ei > bi && this[ei] == ' ') {
    ei -= 1
  }
  if (ei < bi) {
    return ""
  }

  if (bi == 0 && ei == this.length - 1) {
    return this
  }
  return this.substring(bi, ei + 1)
}

String.prototype.replaceAll = function (a, b) {
  return this.split(a).join(b)
}







//express related packages
const express = require('express')
const session = require('express-session')
const upload = require('express-fileupload')
const dbContainer = require('./database/db')
const db = new dbContainer.Database('db')
const qcm = require('../root/ROUTES/API/QCM/qcmRoutes.js')
const api = require('../root/ROUTES/API/api.js')
// import { router } from "../root/ROUTES/API/QCM/qcmRoutes.js";
db.db.serialize(() => {
  db.createModel("user", {
    username: new dbContainer.fields.CharField(100, [new dbContainer.cstr.UniqueField([])]),
    pwd: new dbContainer.fields.CharField(100, []),
    email: new dbContainer.fields.CharField(100, [])
  })
  db.user = db.models.user[3]

  db.createModel("post", {
    fpath: new dbContainer.fields.CharField(100, []),
    userid: new dbContainer.fields.IntegerField([new dbContainer.cstr.ForeignField("user(id)", [])])
  })
  db.post = db.models.post[3]

  db.createModel("permgroup", {
    grpname: new dbContainer.fields.CharField(100, [])
  })
  db.permgroup = db.models.permgroup[3]

  db.createModel("grouplinker", {
    grpid: new dbContainer.fields.IntegerField([new dbContainer.cstr.ForeignField("permgroup(grpid)", [])]),
    userid: new dbContainer.fields.IntegerField([new dbContainer.cstr.ForeignField("user(userid)", [])])
  })
  db.grouplinker = db.models.grouplinker[3]

  db.launchSql()

  const crypto = require('crypto');

  const SECRET_PWD_KEY = 'jfrokhfigqzujfDHFJCKSYLOTIR8IOLU'
  function hash(secret) {
    return crypto.createHmac('sha256', secret)
      .update(SECRET_PWD_KEY)
      .digest('hex');
  }
  /*db.user.objects.create(
    {
      username: "thimote",
      pwd: hash("pwd0")
    }
  )*/

  const GROUPS = [
    'admin',
    'createQCM'
  ]
  function generateGroups() {
    db.permgroup.objects.all(function (err, dat) {
      if (err)
        return

      dat = dat.map(function call(x) { return x.grpname })
      GROUPS.forEach(function call(grp) {
        if (!dat.includes(grp)) {
          db.permgroup.objects.create({ grpname: grp })
        }
      })
    })
  }
  generateGroups()
  /*db.grouplinker.objects.create({
    grpid: 1,
    userid: 1
  })*/

  const app = express()
  app.database = db

  const port = 3000

  app.hash = hash

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
  app.set('views', (__dirname + '/ROUTES/VIEWS/TEMPLATES'));

  //setup session
  app.use(session({ secret: 'idk youre supposed to put a secret here', cookie: { maxAge: 60 * 60 * 1000 } }))

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
  app.use('/qcm', qcm.qcmrouter);
  app.use('/api', api.router)
})