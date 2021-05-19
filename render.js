
__GLOBAL_MICROPROCESS = []
function addMicroProcess(process) {
    __GLOBAL_MICROPROCESS.push(process)
}

function addMicroProcessesData(request, context) {
    for (var i = 0; i < __GLOBAL_MICROPROCESS; i++) {
        __GLOBAL_MICROPROCESS[i](request, context)
    }
}

class Context {
    constructor (data) {
        this.data = data

        this.get = function(str) {
            var strs = str.split(".")

            var fd = this.data
            for (var i = 0; i < strs.length; i++) {
                fd = fd[strs[i]]
            }

            return fd
        }

        this.set = function(str, value) {
            var strs = str.split(".")

            var fd = this.data
            for (var i = 0; i < strs.length - 1; i++) {
                fd = fd[strs[i]]
            }

            fd[strs[strs.length - 1]] = value

            return fd
        }
    }
}

class Renderer {

    constructor(string) {
        this.string = string
        this.chr_id = 0
        this.char = ' '

        this.advance = function() {
            this.chr_id += 1
            if (this.chr_id < this.string.length) {
                this.char = this.string[this.chr_id]
                return true
            }
            return false
        }
        this.next = function() {
            if (this.chr_id + 1 < this.string.length) {
                return this.string[this.chr_id + 1]
            }
            return undefined
        }
        
        this.findEnd = function (start, scon, send) {
            var actual = start + scon.length
            var opened = 1
            
            while (opened != 0) {
                var val0 = this.string.indexOf(scon, actual)
                var val1 = this.string.indexOf(send, actual)
                if (val0 == -1)
                    val0 = this.string.length
                if (val1 == -1)
                    val1 = this.string.length
                
                if (val0 < val1) {
                    actual = val0 + scon.length
                    opened += 1
                } else if (val0 > val1) {
                    actual = val1 + send.length
                    opened -= 1
                } else {
                    throw 'Could not find the end of '+scon+' ('+send+')'
                }
            }

            actual -= send.length

            return actual
        }
        
        this.parseFor = function (str, balEnd) {

            var end = this.findEnd(this.chr_id, "{% for ", "{% endfor %}")
            
            var datas = new Renderer(this.string.substring(balEnd + 1, end)).build()

            this.chr_id = end + 10
            this.advance()

            return new ForNode(str.replace("for", "").smooth().split(" "), datas)
        }
        this.parseIf = function (str, balEnd) {
            var end = this.findEnd(this.chr_id, "{% if ", "{% endif %}")

            var datas = new Renderer(this.string.substring(balEnd + 1, end)).build()

            this.chr_id = end + 10
            this.advance()
            
            return new IfNode(str.replace("if", "").smooth().split(" "), datas)
        }

        this.start_build = function (){
            this.chr_id = -1
            return this.build()
        }

        this.build = function (){
            var data = []
            var str_build = []

            while (this.advance()) {
                if (this.char == "{" && this.next() == "%") {
                    if (str_build.length != 0) {
                        data.push(new StringNode(str_build.join("")))
                        str_build = []
                    } 

                    var end = this.findEnd(this.chr_id, "{%", "%}")

                    var str = this.string.substring(this.chr_id + 2, end).smooth()
                    if (str.startsWith("for")) {
                        data.push(this.parseFor(str, end))
                    } else if (str.startsWith("if")) {
                        data.push(this.parseIf(str, end))
                    } else {
                        throw 'Could not find '+str+' function'
                    }
                } else if (this.char == "{" && this.next() == "{") {
                    if (str_build.length != 0) {
                        data.push(new StringNode(str_build.join("")))
                        str_build = []
                    } 

                    var end = this.findEnd(this.chr_id, "{{", "}}")

                    var str = this.string.substring(this.chr_id + 2, end).smooth()

                    data.push(new EntryNode(str))
                    this.chr_id = end
                    this.advance()
                } else {
                    str_build.push(this.char)
                }
            }

            if (str_build.length != 0) {
                data.push(new StringNode(str_build.join("")))
            } 

            return data
        }
    }

}

class StringNode {
    constructor (string) {
        this.string = string
        this.evaluate = function (context) {
            return this.string
        }
    }
}

class EntryNode {
    constructor (string) {
        this.string = string
        this.string.smooth()
        this.evaluate = function (context) {
            return context.get(this.string)
        }
    }
}

class ForNode {
    constructor (args, toeval) {
        this.args = args
        this.toeval = toeval

        this.evaluate = function (context) {
            var data = context.get(this.args[2])
            var sname = this.args[0]

            var enddata = []

            for (var i = 0; i < data.length; i++) {
                context.set(sname, data[i])

                for (var j = 0; j < this.toeval.length; j ++) {
                    enddata.push(this.toeval[j].evaluate(context))
                }
            }

            return enddata.join("")
        }
    }
}

class IfNode {
    constructor (args, toeval) {
        this.args = args
        this.toeval = toeval
        this.elser = undefined

        this.applyElse = function (elser) {
            if (this.elser != undefined) {
                if (this.elser instanceof ExNode) {
                    throw 'Cannot put else or elseif after end of else'
                }
                this.elser.applyElse(elser)
            } else {
                this.elser = elser
            }
        }

        this.evaluate = function(context) {
            var enddata = []
            var hasNot = this.args[0].startsWith("!")

            if (!hasNot) {
                if (context.get(this.args[0]) == undefined || context.get(this.args[0]) == false) {
                    if (this.elser != undefined) {
                        return this.elser.evaluate(context)
                    }
                } else {
                    for (var j = 0; j < this.toeval.length; j ++) {
                        enddata.push(this.toeval[j].evaluate(context))
                    }
                    return enddata.join("")
                }
            } else {
                if (!(context.get(this.args[0].replace("!","")) == undefined 
                    || context.get(this.args[0].replace("!","")) == false)) {
                    if (this.elser != undefined) {
                        return this.elser.evaluate(context)
                    }
                } else {
                    for (var j = 0; j < this.toeval.length; j ++) {
                        enddata.push(this.toeval[j].evaluate(context))
                    }
                    return enddata.join("")
                }
            }

            return ""
        }
    } 
}

class ExNode {
    constructor (args, toeval) {
        this.args = args
        this.toeval = toeval

        this.evaluate = function(context) {
            var enddata = []
            for (var j = 0; j < this.toeval.length; j ++) {
                enddata.push(this.toeval[j].evaluate(context))
            }
            return enddata
        }
    }
}

function render(string, request, context) {
    addMicroProcessesData(request, context)

    var data = new Renderer(string).start_build()

    for (var i = 0; i < data.length; i++) {
        data[i] = data[i].evaluate(context)
    }

    return data.join("")
}



module.exports = {
    render: render,
    Context: Context
}