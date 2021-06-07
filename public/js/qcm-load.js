
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
const ANSWER_BEGIN = `<li class="${LI_CLASS}">${CHECKBOX}${RESPONSE_BEG}Reponse : `

// Generate single answer HTML
function build_answer(answer) {
    return `${ANSWER_BEGIN}${answer.answer}${RESPONSE_END}</li>`
}

// Generate HTML From answer list
function get_answers(question) {
    return question.answers.map(build_answer).join('')
}

// Generate Question HTML based on a template
function build_question(question) {
    return `Name : ${question.question}<ul class="${UL_CLASS}">${get_answers(question)}</ul>`
}

// Set inner HTML of container to a map of data built from api json
get_qcm(function (json) {
    QUESTION_CONTAINER.innerHTML = json.questions.map(build_question).join('<br>')
})
