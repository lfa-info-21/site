
class ModelField {
    constructor (constraints) {
        this.cstr = constraints
    }
    build (name) {
        throw 'cannot build a base modelfield'
    }
    constraints(name) {
        return `${this.cstr.map((el) => (el.build(name))).join(',')}`
    }
}

class CharField extends ModelField {
    constructor (length, constraints) {
        super(constraints)
        this.len = length
    }
    build (name) {
        return `${name} VARCHAR(${this.len})`
    }
}

class IntegerField extends ModelField {
    constructor (constraints) {
        super(constraints)
    }
    build (name) {
        return `${name} INTEGER`
    }
}

class PrimaryField extends ModelField {
    constructor (constraints) {
        super(constraints)
    }
    build (name) {
        return `${name} INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL`
    }
}

module.exports = {
    CharField: CharField,
    IntegerField: IntegerField,
    PrimaryField: PrimaryField
}
