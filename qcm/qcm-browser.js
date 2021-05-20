
const fs = require('fs')
const qcm = require('./qcm')
const PAGINATED_COUNT = 10

function paginate (arr, page) {
    var narr = []
    for (var i = page * PAGINATED_COUNT; i < Math.min((page + 1) * PAGINATED_COUNT, arr.length); i++) {
        narr.push(arr[i])
    }
    return narr
}

function browse (page) {
    var arr = fs.readdirSync('./qcm/data')

    arr = paginate(arr, page)

    for (var i = 0; i < arr.length; i++) {
        arr[i] = qcm.buildQcm(JSON.parse(fs.readFileSync('./qcm/data/'+arr[i], 'utf-8')))
    }

    return arr
}

function pageCount () {
    var arr = fs.readdirSync('./qcm/data')

    return Math.floor(arr.length / PAGINATED_COUNT)
}

module.exports = {
    browse: browse,
    pageCount: pageCount
}