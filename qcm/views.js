
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
    if (!req.session.perm_lvl[0] && !req.session.perm_lvl[1]) {
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
  
    res.render("qcm/qcm-browser.html", {"qcms":qcmbrowser.browse(page), 'page':page, 'max_page':qcmbrowser.pageCount()})
  })  
  
  router.get('/:qcm', (req, res) => {
      var qcm = qcmcreator.getObject(req.params.qcm)
  
      res.render("qcm/qcm.html",{"qcm":qcm})
  })
  


module.exports = {
    router: router
}