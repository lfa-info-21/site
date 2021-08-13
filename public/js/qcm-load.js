
// System Constants
const ACT_URL = document.location.pathname
const API_URL = `/api${ACT_URL}`
const QUESTION_CONTAINER = document.getElementById('qcm-container')

// Get JSON from API
function get_qcm(call) {
    fetch(API_URL).then(function to_js(res) {
        res.json().then(call)
    })
}

// HTML constants to avoid having to check directly into the build code
const UL_CLASS = ""
const LI_CLASS = ""
const CHECKBOX_SPAN = `<span class="slider round"></span>`
const CHECKBOX_INPUT = `<input type="checkbox">`
const CHECKBOX = `
<label class="switch">
    ${CHECKBOX_INPUT}
    ${CHECKBOX_SPAN}
</label>
`
const RESPONSE_BEG = ""
const RESPONSE_END = ""
const ANSWER_BEGIN = `<div class="userChoice"><input id="option1" name="option1" type="checkbox"/><label for="option1">`
let index = 0;

// Generate single answer HTML
function build_answer(answer) {
    index += 1;
    const OPTIONSTR = `option${index}`
    return `${ANSWER_BEGIN.split("option1").join(OPTIONSTR)}${answer.answer}${RESPONSE_END}</label></div>`
}

// Generate HTML From answer list
function get_answers(question) {
    return question.answers.map(build_answer).join('')
}

// Generate Question HTML based on a template
function build_question(question) {
    return `<h2>${question.question}</h2>${get_answers(question)}`
}

// Set inner HTML of container to a map of data built from api json
get_qcm(function (json) {
    QUESTION_CONTAINER.innerHTML = `<form class="form">${json.questions.map(build_question).join('<br>')}</form>`
    convert_qcm()
})
