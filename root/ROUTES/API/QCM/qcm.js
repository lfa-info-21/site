
class Answer {
    constructor(answer, status) {
        this.answer = answer
        this.status = status

        this.smooth = function () {
            this.answer = this.answer.smooth()
        }
    }
}

class Question {
    constructor(question, answers, coefficient) {
        this.question = question
        this.answers = answers
        this.coefficient = coefficient

        this.shuffle = function () {
            this.answers.shuffle()
        }

        this.smooth = function () {
            this.answers.forEach((el) => {
                el.smooth()
            })
            this.question = this.question.smooth()
            return this
        }
    }
}

class QCM {
    constructor(questions, name, author, uuid, category) {
        this.questions = questions
        this.name = name
        this.author = author
        this.uuid = uuid
        this.category = category

        this.shuffle = function () {
            this.questions.forEach((el) => {
                el.shuffle()
            })
            this.questions.shuffle()
        }

        this.smooth = function () {
            this.questions.forEach((el) => {
                el.smooth()
            })
            return this
        }
    }
}

const buildAnswer = function (json) {
    var answer = json['answer']
    var status = json['status']

    return new Answer(answer, status)
}

const buildQuestion = function (json) {
    var question = json['question']
    var answers = []
    json['answers'].forEach((el) => {
        answers.push(buildAnswer(el))
    })
    var coefficient = json['coefficient']

    return new Question(question, answers, coefficient)
}

const buildQcm = function (json) {
    var questions = []
    json['questions'].forEach((el) => {
        questions.push(buildQuestion(el))
    })
    return new QCM(questions, json['name'], json['author'], json['uuid'], json['category'])
}

const QCMBuilder = {
    "fromLatex": function fromLatex(string) {
        var data = new latexsys.LatexInterpreter(string).start_build()
        var questions = []

        data.query("element{amc}").forEach((qu) => {

            var parameters = qu.parameters
            if (parameters.length != 2) {
                throw 'Element{amc} must contain 2 parameters, got ' + parameters.length
            }

            parameters = parameters[1]
            var coef_cont = ""
            var isQuNameLaunched = false
            var QuName = []
            for (var i = 0; i < parameters.length; i++) {
                if (parameters[i] instanceof latexsys.ParameteredAntiSlash && parameters[i].name == "begin") {
                    isQuNameLaunched = false
                }

                if (isQuNameLaunched) {
                    QuName.push(parameters[i])
                }

                if (parameters[i] instanceof latexsys.ParameteredAntiSlash && parameters[i].name == "bareme") {
                    isQuNameLaunched = true
                    if (parameters[i].parameters.length != 1) {
                        throw 'Expected 1 parameter in bareme, got ' + parameters[i].parameters.length
                    }
                    coef_cont = parameters[i].parameters[0]
                }
            }
            var rName = new latexsys.LatexBuilder(QuName).build()

            var answers = []
            qu.query("mauvaise|bonne").forEach((ans) => {
                var b = false
                if (ans.name == "bonne") {
                    b = true
                }

                if (ans.parameters.length != 1) {
                    throw 'Expected 1 parameter in bonne/mauvaise, got ' + ans.parameters.length
                }

                var param = ans.parameters
                if (ans.parameters[0] instanceof Array) {
                    param = ans.parameters[0]
                }

                answers.push(new Answer(new latexsys.LatexBuilder(param).build(), b))
            })

            questions.push(new Question(rName, answers, Number(coef_cont.split(",")[0].split("=")[1])))
        })

        return new QCM(questions, "", "", "", "").smooth()
    }
}
Object.freeze(QCMBuilder)

const latexsys = require('./latex')

module.exports = {
    QCM: QCM,
    QCMBuilder: QCMBuilder,
    buildQcm: buildQcm
}