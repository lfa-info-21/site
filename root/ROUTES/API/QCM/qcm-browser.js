const fs = require('fs')
const qcm = require('./qcm')
const PAGINATED_COUNT = 10
const NEED_PAGINATION = false;

function paginate (arr, page) {
    if (!NEED_PAGINATION)
        return arr

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
        arr[i] = qcm.buildQcm(JSON.parse(fs.readFileSync('./qcm-data/'+arr[i], 'utf-8')))
    }

    return arr
}

function pageCount () {
    if (!NEED_PAGINATION)
        return 1;

    var arr = fs.readdirSync('./qcm-data')

    return Math.floor(arr.length / PAGINATED_COUNT)
}

module.exports = {
    browse: browse,
    pageCount: pageCount
}