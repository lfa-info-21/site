
const express = require('express')
const fs = require('fs')

const latexsys = require('./latex')
const qcmloader = require('./qcm')
const renderer = require('./render')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/qcm/:qcm', (req, res) => {
    var data = fs.readFileSync("templates/qcm.html", 'utf-8')

    var qcm = qcmloader.QCMBuilder.fromLatex(latexsys.LATEX_QCM1)
    qcm.shuffle()
    console.log(qcm)

    res.send(renderer.render(data, req, new renderer.Context({"qcm":qcm})))
}) 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
