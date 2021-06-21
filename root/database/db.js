
// database
const sqlite3 = require('sqlite3')
const model = require('./sql/model')
const fields = require('./sql/field')
const cstr = require('./sql/constraints')

class Database {
    constructor(db_name) {
        this.db = new sqlite3.Database(`./${db_name}.sqlite3`)

        this.models = {

        }
    }
    createModel (table_name, keys) {
        if (this.models[table_name]) {
            throw `The table ${table_name} has already been used in this database`
        }

        keys['id'] = new fields.PrimaryField([])

        var foreigns = []

        Object.entries(keys).forEach((val) => {
            val[1].cstr.filter((el) => (el instanceof cstr.ForeignField)).forEach((el) => {
                foreigns.push(new model.ForeignKey(el.ref.replaceAll(")", "").split("(")[1], 
                el.ref.replaceAll(")", "").split("(")[0]))
            })
        })

        this.models[table_name] = [
            table_name,
            foreigns,
            keys,
            new model.Model(
                table_name,
                foreigns,
                keys,
                this.db
            )
        ]

        this.models[table_name].push(this.genSql(table_name))
    }
    genSql (table_name) {
        if (this.models[table_name] == undefined) {
            throw `The table ${table_name} does not exist`
        }
        
        if (this.models[table_name].length != 4) {
            return false
        }
    
        var L0 = `CREATE TABLE IF NOT EXISTS ${table_name} \n(\n`;
        var L1 = `${Object.entries(this.models[table_name][2]).map(
            (arr) => {
                return arr[1].build(arr[0])
            }
        ).join(',\n')}`
        var L2 = `${Object.entries(this.models[table_name][2]).filter((arr) => {
            return arr[1].cstr.length != 0
        }).map(
            (arr) => {
                return arr[1].constraints(arr[0])
            }
        ).join(',\n')}`
        var L3 = "\n);"

        if (L2 == '' || L2 == undefined) {
            return `${L0}\n${L1}\n${L3}`
        }
        return `${L0}\n${L1},\n${L2}\n${L3}`
    }
    launchSql() {
        Object.entries(this.models).forEach((val)=>{
            this.db.run(val[1][4])
        })
    }
}

module.exports = {
    Database:Database,
    model:model,
    fields:fields,
    cstr:cstr
}
