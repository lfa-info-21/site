
var express = require('express')
var router = express.Router()

//node packages
const fs = require('fs')

const api = require('../api/api')

//qcm packages
const latexsys = require('./latex')
const qcmloader = require('./qcm')
const qcmcreator = require('./qcm-loader')
const qcmbrowser = require('./qcm-browser')

//########## QCM ##########

  router.get('/create/', (req, res) => {
    if (!req.session.logged_in) {
      res.redirect('/')
      return
    }
    if (!req.session.permissions.includes("admin")) {
      res.redirect('/')
      return
    }
  
    res.render("qcm/qcm-create.html")
  })
  router.get('/browse/', (req, res) => {
    var page = 0
    if (req.query.page) {
      page = Number(req.query.page)
      if (page < 0) {
        page = 0
      }
    }
   
    res.render("qcm/qcm-browser.html",{})
  })  
  
  router.get('/:qcm', (req, res) => {
      var qcm = qcmcreator.getObject(req.params.qcm)

      res.render("qcm/qcm.html",{"qcm":qcm})
      // trouver un qcm et remplacer son json
  })
  
  


module.exports = {
    router: router
}