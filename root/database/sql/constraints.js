
class ConstraintField {
    build (name) {
        throw 'cannot build a base constraintfield'
    }
}

class UniqueField extends ConstraintField {
    constructor(clause) {
        super()
        this.cl = clause
    }
    build (name) {
        return `unique(${name}) ${this.cl}`
    }
}

class ForeignField extends ConstraintField {
    constructor(ref, clause) {
        super()
        this.ref = ref
        this.cl = clause
    }
    build (name) {
        return `FOREIGN KEY(${name}) REFERENCES ${this.ref} ${this.cl}`
    }
}

module.exports = {
    UniqueField: UniqueField,
    ForeignField: ForeignField
}
