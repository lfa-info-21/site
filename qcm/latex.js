
const utils = require('../utils')
const token_sys = require("./tokens")

const TokenTypeEnums = {

    "ANTISLASH":"ANTISLASH",
    "NAME":"NAME",
    "LEFTCURLYBRACKET":"LEFTCURLYBRACKET",
    "RIGHTCURLYBRACKET":"RIGHTCURLYBRACKET",
    "NOTOKEN":"NOTOKEN",

}
Object.freeze(TokenTypeEnums)
const NAME_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=()-*/^<>|[], éèà?!.$\'\"ôêâîëöïäüû%:"
const IGNORE_CHARS = "\t\n\r"

class LatexLexer {
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
        this.isName = function (chr) {
            for (var i = 0; i < NAME_CHARS.length; i++) {
                if (chr == NAME_CHARS[i]) {
                    return true
                }
            }
            return false
        }
        this.isIgnore = function (chr) {
            for (var i = 0; i < IGNORE_CHARS.length; i++) {
                if (chr == IGNORE_CHARS[i]) {
                    return true
                }
            }
            return false
        }
        this.parseName = function () {
            var str = ""

            this.chr_id -= 1

            do {
                this.advance()

                str += this.char
            } while (this.next() != undefined && this.isName(this.next()));

            return new token_sys.TokenType(str, TokenTypeEnums["NAME"])
        }

        this.build = function() {
            this.chr_id = -1

            var tokens = [

            ]

            while( this.advance() ) {

                if ( this.isName(this.char) ) {
                    tokens.push(this.parseName())
                } else if ( this.char == "\\" ) {
                    tokens.push(new token_sys.TokenType(undefined, TokenTypeEnums["ANTISLASH"]))
                } else if ( this.char == "{" ) {
                    tokens.push(new token_sys.TokenType(undefined, TokenTypeEnums["LEFTCURLYBRACKET"]))
                } else if ( this.char == "}" ) {
                    tokens.push(new token_sys.TokenType(undefined, TokenTypeEnums["RIGHTCURLYBRACKET"]))
                } else if ( !this.isIgnore(this.char) ) {
                    throw 'The character '+this.char+' is not usable in the current latex parser'
                }

            }

            return tokens

        }   
    }
}

function include(arr, data) {
    for (var i = 0; i < arr.length ; i++) {
        if (data == arr[i]) {
            return true
        }
    }
    return false
}

function indexOf(arr, data, defaultvalue=-1) {
    for (var i = 0; i < arr.length ; i++) {
        if (data == arr[i]) {
            return i
        }
    }
    return defaultvalue
}

class LatexInterpreter {

    constructor (string) {
        this.lexer = new LatexLexer(string)
        this.tokens = this.lexer.build()
        this.token = new token_sys.TokenType(undefined, TokenTypeEnums["NOTOKEN"])
        this.token_id = 0
        this.advance = function () {
            this.token_id += 1
            if (this.token_id < this.tokens.length) {
                this.token = this.tokens[this.token_id]
                return true
            }
            return false
        }
        this.isCorrect = function() {
            return this.token_id < this.tokens.length
        }
        this.next = function() {
            if (this.token_id + 1 < this.tokens.length) {
                return this.tokens[this.token_id + 1]
            }
            return undefined
        }
        this.parseAntiSlashArgs = function() {
            var fargs = []

            while (this.token.type == TokenTypeEnums["LEFTCURLYBRACKET"]) {
                if (this.advance()) {
                    var args = this.build()

                    if (this.isCorrect()) {
                        if (this.token.type == TokenTypeEnums["RIGHTCURLYBRACKET"]) {
                            this.advance()
                            if (args.length <= 1) {
                                fargs.push(...args)
                            } else {
                                fargs.push(args)
                            }
                        } else {
                            throw 'Expected \'}\' after \'{\' and the expression'
                        }
                    } else {
                        throw 'Expected at least a character after \'{\' and the expression'
                    }
                } else {
                    throw 'Expected an expression after \'{\''
                }
            }

            this.token_id -= 2
            this.advance()

            return fargs
        }
        this.parseAntiSlash = function() {
            var cp_tok_id = this.token_id

            if (this.advance() && this.token.type == TokenTypeEnums["NAME"]) {
                var string = this.token.value

                if (include(string, ' ')) {
                    this.token.value = string.substring(indexOf(string, ' ') + 1)
                    string = string.substring(0, indexOf(string, ' '))
                    this.token_id -= 1
                    
                    return new ParameteredAntiSlash(string, [])
                } else {
                    this.advance()
                    return new ParameteredAntiSlash(string, this.parseAntiSlashArgs())
                }
            }
        }

        this.start_build = function() {
            this.token_id = -1
            this.advance()
            this.tokens = this.lexer.build()
            return new ParameteredAntiSlash("body", this.build())
        }
        this.build = function() {
            if (this.tokens.length == 0) {
                throw 'Empty Latex found, not supported by base'
            }

            var datas = [

            ]

            do {
                if (this.token.type == TokenTypeEnums["ANTISLASH"]) {
                    datas.push(this.parseAntiSlash())
                } else {
                    var str_to_add = ""
                    if (this.token.type == TokenTypeEnums["NAME"]) {
                        str_to_add = this.token.value
                    } else if (this.token.type == TokenTypeEnums["RIGHTCURLYBRACKET"]) {
                        break
                    } else {
                        throw 'Unknown token found '+this.token.type
                    }

                    if (datas.length == 0 || (datas[datas.length - 1] instanceof ParameteredAntiSlash)) {
                        datas.push("")
                    }
                    datas[datas.length - 1] += str_to_add
                }
            } while (this.advance());

            return datas
        }
    }
}

class LatexBuilder {
    constructor(arr) {
        this.arr = arr

        this.build = function () {
            var narr = []

            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i] instanceof Array) {
                    narr.push(new LatexBuilder(this.arr[i]).build())
                    narr.push(" ")
                } else if (this.arr[i] instanceof ParameteredAntiSlash) {
                    narr.push("\\")
                    narr.push(this.arr[i].name)

                    this.arr[i].parameters.forEach((param) => {
                        narr.push("{")
                        narr.push(new LatexBuilder([param]).build())
                        narr.push("}")
                    })
                    narr.push(" ")
                } else {
                    narr.push(this.arr[i])
                }
            }

            return narr.join("")
        }
    }
}

class ParameteredAntiSlash {
    constructor(name, parameters) {
        this.name = name
        this.parameters = parameters
        this.parent = undefined
        this.updateParamParents = function() {
            for(var i = 0; i < this.parameters.length; i++) {
                if (this.parameters[i] instanceof ParameteredAntiSlash) {
                    this.parameters[i].parent = this
                } else if (this.parameters[i] instanceof Array) {
                    for(var j = 0; j < this.parameters[i].length; j++) {
                        if (this.parameters[i][j] instanceof ParameteredAntiSlash) {
                            this.parameters[i][j].parent = this
                        }
                    }
                }
            }
        }
        this.updateParamParents()

        this.checkParameter = function (object, param) {
            if (param.startsWith("!")) {
                return !include(object.parameters, param.replace("!", ""))
            }
            return include(object.parameters, param)
        }

        this.checkParameters = function (object, param) {
            if (object instanceof ParameteredAntiSlash &&
                object.name == param.name) {
                for (var jindex = 0; jindex < param.parameters.length; jindex ++) {
                    if (!this.checkParameter(object, param.parameters[jindex])) {
                        return false
                    }
                }
                return true
            }
            return false
        }

        this.query = function (string) {
            var arr = []

            this._$query(string, arr)

            return arr
        }

        this._$query = function (string, arr) {
            if (string == "") {
                arr.push(this)
                return
            }

            var pointIndex = indexOf(string, '.')

            var strs = ""
            if (pointIndex != -1) {
                strs = string.substring(0, pointIndex).split("|")
            } else {
                strs = string.split("|")
            }

            var nextString = ""
            if (pointIndex != -1) {
                nextString = string.substring(pointIndex+1)
            }

            for (var sj = 0; sj < strs.length; sj++) {
                var str = strs[sj]

                var str_body = new LatexInterpreter('\\'+str).start_build()
                if (str_body.parameters.length != 1) {
                    throw 'Expected one name separated by points, got '+parameters.length
                }

                var parameter = str_body.parameters[0]
                if (!(parameter instanceof ParameteredAntiSlash)) {
                    throw 'Expected a latex object, got a string'
                }

                for (var i = 0; i < this.parameters.length; i++) {
                    if (!(this.parameters[i] instanceof Array)) {
                        if (this.checkParameters(this.parameters[i], parameter)) {
                            this.parameters[i]._$query(nextString, arr)
                        }
                    } else {
                        for (var u = 0; u < this.parameters[i].length; u++) {
                            if (this.checkParameters(this.parameters[i][u], parameter)) {
                                this.parameters[i][u]._$query(nextString, arr)
                            }
                        }
                    }
                }
            }
        }
    }
}

// Latex example of a QCM
const LATEX_QCM1 = `
\\documentclass{article}

\\usepackage[utf8x]{inputenc}    
\\usepackage[T1]{fontenc}

\\usepackage[bloc,completemulti]{automultiplechoice}    
\\usepackage{multicol}
\\begin{document}

\\AMCrandomseed{1237893}
\\element{amc}{
  \\begin{question}{nombres1}\\bareme{b=2,m=0}
    Combien de chiffres différents faut-il pour écrire les décimales de 23/27?
    \\begin{multicols}{2}
      \\begin{reponses}
        \\mauvaise{$1$}
        \\mauvaise{$2$}
        \\bonne{$3$}
        \\mauvaise{$4$}
        \\mauvaise{$5$}
      \\end{reponses}
    \\end{multicols}
  \\end{question}
}
\\element{amc}{
  \\begin{question}{nombres2}\\bareme{b=4,m=0}
    Le nombre $\\sqrt{720}$ est rationnel?
    \\begin{multicols}{2}
      \\begin{reponses}
        \\mauvaise{Vrai}
        \\bonne{Faux}
      \\end{reponses}
    \\end{multicols}
  \\end{question}
}
\\element{amc}{
  \\begin{question}{nombres4}\\bareme{b=4,m=0}
    La quantité $(1+\\sqrt{2})/(1-\\sqrt{2})$ est égale à
    \\begin{multicols}{2}
      \\begin{reponses}
        \\mauvaise{$2-\\sqrt{3}$}
        \\mauvaise{$-3-\\sqrt{3}$}
        \\mauvaise{$-3+\\sqrt{3}$}
        \\bonne{$-2-\\sqrt{3}$}
      \\end{reponses}
    \\end{multicols}
  \\end{question}
}
\\element{amc}{
  \\begin{question}{vecteursbase}\\bareme{b=4,m=0}
 On considère un carré $ABCD$ et on note $I$ le milieu du segment $[AB]$. Dans la base $\\overrightarrow{AB}$, $\\overrightarrow{AC}$
 on note $a,b$ les coordonnées du vecteur $\\overrightarrow{IC}$. On a $a+2b=$
 \\begin{reponses}
        \\mauvaise{3}
        \\bonne{3/2}
         \\mauvaise{5/2}
        \\mauvaise{2}
          \\mauvaise{Aucune des autres réponses proposées n'est correcte}
        \\end{reponses}
  \\end{question}
}
\\element{amc}{
  \\begin{question}{vecteurssimplification}\\bareme{b=4,m=0}
 On considère un carré $ABCD$ et on note $I,J,K,L$ les milieux des côtés $[AB]$, $[BC]$, $[CD]$ et $[DA]$.
 L'expression $\\overrightarrow{AJ}+\\overrightarrow{BK}+\\overrightarrow{CL}+\\overrightarrow{DI}$ est égale à
 \\begin{reponses}
        \\mauvaise{$\\overrightarrow{IJ}$}
        \\mauvaise{$\\overrightarrow{IK}$}
         \\mauvaise{$\\overrightarrow{IL}$}
        \\bonne{$\\overrightarrow{0}$}
          \\mauvaise{Aucune des réponses proposées n'est correcte}
        \\end{reponses}
  \\end{question}
}
\\exemplaire{29}{    

%%% debut de l'en-tête des copies :    

\\noindent{\\bf Nombres et second degré  \\hfill Test du 27/09/2019}

\\vspace{3ex}

\\noindent\\AMCcode{etu}{2}\\hspace*{\\fill}
\\begin{minipage}{.5\\linewidth}
$\\longleftarrow{}$ codez votre numéro d'élève ci-contre, et écrivez votre nom et prénom ci-dessous.

\\vspace{3ex}

\\champnom{\\fbox{    
    \\begin{minipage}{.9\\linewidth}
      Nom et prénom :
      
      \\vspace*{.5cm}\\dotfill
      \\vspace*{1mm}
    \\end{minipage}
  }}\\end{minipage}

\\vspace{1ex}

\\noindent\\hrulefill

\\vspace{2ex}

\\begin{center}
  Les questions peuvent avoir plusieurs une ou plusieurs bonnes réponses. Chaque bonne réponse donne 1 point,
  chaque mauvaise réponse fait perdre 1 point donc ne répondez pas au hasard. Bon courage!
\\end{center}

\\noindent\\hrulefill

\\vspace{2ex}
%%% fin de l'en-tête

\\melangegroupe{amc}
\\restituegroupe{amc}

\\clearpage    

}   

\\end{document}
`

module.exports = {
    LATEX_QCM1:LATEX_QCM1,
    LatexInterpreter:LatexInterpreter,
    LatexBuilder:LatexBuilder,
    LatexLexer:LatexLexer,
    ParameteredAntiSlash:ParameteredAntiSlash 
}