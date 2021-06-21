

const model = require('./database/sql/model')
const get_models = model.models

var express = require('express')
var router = express.Router()

const PAGE_OBJECT_COUNT = 10

function check_rights(req, res) {
    if (!req.session.logged_in || !req.session.permissions.includes('admin')) {
        res.redirect('/')
        return true
    }
    return false
}

router.get('/', function admin_home(req, res) {
    if (check_rights(req, res)) {
        return
    }

    data = [

    ]
    var models = get_models()
    Object.keys(models).forEach(function (el) {
        data.push([ el, models[el] ])
    })

    res.render('admin/home.html', { models:data })
})

router.get('/m/:model', function admin_mhome(req, res) {
    if (check_rights(req, res)) {
        return
    }

    var page = 0
    if (req.query.page) {
        page = Number(req.query.page)
    }

    var actmodel = get_models()[req.params.model]
    actmodel.objects.filter({}).setLimit(PAGE_OBJECT_COUNT).setOffset(PAGE_OBJECT_COUNT * page).all(function call(err, dat) {
        res.render('admin/model.html', { model:actmodel, query:dat })
    })
})

router.get('/m/:model/o/:id', function admin_mhome(req, res) {
    if (check_rights(req, res)) {
        return
    }

    var actmodel = get_models()[req.params.model]
    var id = Number(req.params.id)
    actmodel.objects.filter({ id:id }).all( function (err, dat) {
        if (err || dat == undefined || dat.length != 1) {
            res.redirect(`/m/${req.params.model}`)
            return
        }

        var object = dat[0]

        res.render('admin/object.html', { object:object, model:actmodel, url:`/admin/m/${req.params.model}/o/${id}` })
    } )
})

router.post('/m/:model/o/:id/update', function admin_mhome(req, res) {
    if (check_rights(req, res)) {
        return
    }
    
    var actmodel = get_models()[req.params.model]
    var id = Number(req.params.id)
    actmodel.objects.filter({ id:id }).update(0, req.body, function call(err, dat) {})

    res.redirect(`/admin/m/${req.params.model}/o/${id}`)
})

module.exports = {
    router: router
}
