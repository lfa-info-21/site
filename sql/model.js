const { isString } = require("util")
const { threadId } = require("worker_threads")

class SQLQueryer {
    constructor (tname, sql, db) {
        this.sql = sql
        this.tname = tname
        this.db = db
    }
    all (callback) {
       this.db.all(this.sql, callback) 
    }
    update (index, values, callback) {
        var thisObj = this
        this.all(function (err, all) {
            console.log(err)
            var d = all[index]
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
            console.log(all)
            thisObj.db.run(all, callback)
        })
    }
    create (values) {

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
        return new SQLQueryer(this.tname, this.sql + " " + this.buildFilters(filters), this.db)
    }
}

class Model {
    constructor (table_name, db) {
        this.objects = new SQLQueryer(table_name, `SELECT * FROM ${table_name}`, db)
    }
}

module.exports = {
    Model: Model
}