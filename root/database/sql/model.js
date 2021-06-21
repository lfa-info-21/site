const { isString } = require("util")

class ForeignKey {
    constructor (name, model) {
        this.model = model
        this.name = name
    }
}

class SQLQueryer {
    constructor (tname, sql, db, model, limit, offset) {
        this.sql = sql
        this.tname = tname
        this.db = db
        this.model = model
        this.limit = limit
        this.offset = offset
    }
    async buildForeign (dat, foreign) {
        var id = dat[foreign.name]

        var objs = await foreign.model.objects.filter({ id:id }).asyncAll()

        var obj = undefined
        if (objs.length > 0) {
            obj = objs[0]
        }

        return obj
    }
    async buildForeigns (data) {
        for (var i = 0; i < this.model.foreign_keys.length; i++) {
            data["$"+this.model.foreign_keys[i].name] = await this.buildForeign(data, this.model.foreign_keys[i])
        }
        return data
    }
    buildOffset() {
        if (this.offset == "") {
            return ""
        }
        return ` OFFSET ${this.offset}`
    }
    buildLimit() {
        if (this.limit == "") {
            return ""
        }
        return ` LIMIT ${this.limit}${this.buildOffset()}`
    }
    all (callback) {
        var thisObj = this
       this.db.all(this.sql+this.buildLimit(), async function (err, dat) {
           if (err) {
               callback(err, dat)
               return
           }
           for (var i = 0; i < dat.length; i++) {
               dat[i] = await thisObj.buildForeigns(dat[i])
           }
           callback(err, dat)
       })
    }
    setLimit(value) {
        this.limit = value
        return this
    }
    setOffset(value) {
        this.offset = value
        return this
    }
    delete (index, callback) {
        var thisObj = this
        this.all(function (err, all) {
            if (err || all == undefined || all.length <= 0 || all.length <= index) {
                return
            }

            var d = all[index]

            if (d == undefined) {
                return
            }

            var sql = `DELETE FROM ${thisObj.model.table_name} WHERE id=${d.id}`
            thisObj.db.run(sql, callback) 
        })
    }
    update (index, values, callback) {
        if (index < 0) {
            return
        }
        var thisObj = this
        this.all(function (err, all) {
            if (err || all == undefined || all.length <= 0 || all.length <= index) {
                return
            }
            
            var d = all[index]

            if (d == undefined) {
                return
            }

            var filt_template = " WHERE id="+d.id+" "
            var upd_template = "UPDATE "+thisObj.tname+" "

            var templ_mod = "SET "
            for (var i = 0; i<Object.keys(values).length; i++) {
                if (templ_mod != "SET ") {
                    templ_mod += ", "
                }
                templ_mod += Object.keys(values)[i] + " = " + thisObj.buildFilter(values[Object.keys(values)[i]])
            }
            
            var all = upd_template+templ_mod+filt_template

            thisObj.db.run(all, callback)
        })
    }
    create (values, callback) {
        var dt = `INSERT INTO ${this.tname} (${Object.keys(values).join(', ')}) VALUES (${Object.values(values).map(this.buildFilter).join(', ')})`
        if (Object.keys(values).length == 0) {
            dt = `INSERT INTO ${this.tname} DEFAULT VALUES`
        }
        
        this.db.run(dt, callback)
    }
    buildFilter (filter) {
        if (isString(filter)) {
            return `"${filter}"`
        }
        return `${filter}`
    }
    buildFilters (filters) {
        if (Object.keys(filters).length == 0)
            return ""

        var filter = "WHERE "

        Object.keys(filters).forEach((key) => {
            if (filter != "WHERE ")
                filter += " AND "
            filter += `${key}=${this.buildFilter(filters[key])}`
        })

        return filter
    }
    filter (filters) {
        return new SQLQueryer(this.tname, this.sql + " " + this.buildFilters(filters), this.db, this.model, this.limit, this.offset)
    }
    asyncAll () {
        return new Promise(resolve => {
            this.all(function (err, dat) {
                  resolve(dat)
              })
          });
    }
    asyncCreate (values) {
        return new Promise(resolve => {
            this.create(values, function (err, dat) {
                  resolve(dat)
              })
          });
    }
    asyncUpdate (values) {
        return new Promise(resolve => {
            this.update(values, function (err, dat) {
                  resolve(dat)
              })
          });
    }
}

class Model {
    constructor (table_name, foreign_keys, objects, db) {
        models_created[table_name] = this

        this.columns = objects
        this.table_name = table_name
        this.foreign_keys = foreign_keys
        this.objects = new SQLQueryer(table_name, `SELECT * FROM ${table_name}`, db, this, "", "")
    }
    buildForeign() {
        for(var i = 0; i < this.foreign_keys.length; i++) {
            this.foreign_keys[i].model = models_created[this.foreign_keys[i].model]
        }
    }
    setToString(func) {
        this.toStr = func
    }
    toStr(obj) {
        return `<${this.table_name} id=${obj.id}>`
    }
}

var models_created = {}
function models () {
    return models_created
}

module.exports = {
    Model: Model,
    ForeignKey: ForeignKey,
    models: models,
}