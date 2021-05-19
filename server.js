
const express = require('express')
const upload = require('express-fileupload')
const fs = require('fs')

const latexsys = require('./qcm/latex')
const qcmloader = require('./qcm/qcm')
const qcmcreator = require('./qcm/qcm-loader')
const renderer = require('./render')

const app = express()
const port = 3000
app.use(upload())
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/qcm/create/', (req, res) => {
  var data = fs.readFileSync("templates/qcm-create.html", 'utf-8')

  res.send(renderer.render(data, req, new renderer.Context()))
}) 

app.post('/qcm/create', (req, res) => {
  qcmcreator.createObject(req.files['file'], req.body.text)
  var data = fs.readFileSync("templates/qcm.html", 'utf-8')

  var qcm = qcmloader.QCMBuilder.fromLatex(latexsys.LATEX_QCM1)
  qcm.shuffle()

  res.send(renderer.render(data, req, new renderer.Context({"qcm":qcm})))
}) 

app.get('/qcm/:qcm', (req, res) => {
    var data = fs.readFileSync("templates/qcm.html", 'utf-8')
  
    var qcm = qcmcreator.getObject(req.params.qcm)

    res.send(renderer.render(data, req, new renderer.Context({"qcm":qcm})))
}) 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
