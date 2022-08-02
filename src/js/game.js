var properties = {
    getNumGuesses: function (wordLength) {
        if (wordLength < 5) {
            return 5
        }
        if (wordLength > 6) {
            return 7
        }
        return 6
    }
}

export default properties;