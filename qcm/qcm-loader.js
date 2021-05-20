
const qcmloader = require('./qcm')
const fs = require('fs')

const genQcmUuidPrivate = function() {
    var s = ['q']
    for (var i = 0; i < 10; i++) {
        s.push((Math.floor(Math.random() * 10) % 10).toString())
    }
    return s.join("")
}

const genQcmUuid = function () {
    var uuid = genQcmUuidPrivate()
    
    while(fs.existsSync('./qcm/data/'+uuid+'.json')) {
        uuid = genQcmUuidPrivate()
    }

    return uuid
}

function getObject(uuid) {
    var dt = JSON.parse(fs.readFileSync('./qcm/data/'+uuid+'.json', 'utf-8'))

    return qcmloader.buildQcm(dt)
}

function createObject(file, name) {
    var data = file.data.toString('utf-8')
    
    var qcm = qcmloader.QCMBuilder.fromLatex(data)
    qcm.author = 'Unknown'
    qcm.name = name
    qcm.uuid = genQcmUuid()

    storeObject(qcm)

    return qcm
}

function storeObject(qcm) {
    var dt = JSON.stringify(qcm)

    fs.writeFileSync('./qcm/data/'+qcm.uuid+'.json', dt)
}

module.exports = {
    createObject: createObject,
    getObject: getObject
}
