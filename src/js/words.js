import COMPANIES from "./words/companies"
import GENERAL_WORDS from "./words/general"
import PEOPLE from "./words/people"
import SLANG from "./words/slang"
import TECHNICAL_WORDS from "./words/technical"
var words = []

function addWordList(wordList, blockFromDaily, blockFromPractice) {
    words.push({
        list: wordList,
        blockDaily: blockFromDaily || false,
        blockPractice: blockFromPractice || false
    })
}

let cookie = window.$cookies.get("BAJADLE-COOKIE")

if (cookie === null) {
    cookie = {
        practice_disallowCompanies: false,
        practice_disallowGeneral: false,
        practice_disallowNames: false,
        practice_disallowTechnical: false,
        practice_disallowSlang: false
    }
}

addWordList(COMPANIES, false, cookie.practice_disallowCompanies)
addWordList(GENERAL_WORDS, false, cookie.practice_disallowGeneral)
addWordList(PEOPLE, true, cookie.practice_disallowNames)
addWordList(SLANG, false, cookie.practice_disallowSlang)
addWordList(TECHNICAL_WORDS, false, cookie.practice_disallowTechnical)

function getWordList(isDaily) {
    var array = ["baja"]
    var property = "blockPractice"
    if (isDaily) {
        property = "blockDaily"
    }
    words.forEach(list => {
        if (!list[property]) {
            array = array.concat(list.list)
        }
    })
    return array
}

export default getWordList;