<template>
    <div :class="['game-container', cookie.nightMode && 'nightMode']">
        <Transition>
          <div class="message" v-if="this.msg.showMessage">
            <span v-for="(line, index) in this.msg.message" :key="`msg-row ${index}`">
              {{ line }}<br>
            </span>
            <span v-if="this.msg.showEndBlurb">
              <br>
              <button @click="copyResultGrid()">Share</button> &nbsp;
              <button @click="goToInfinite()">
                  <span v-if="this.daily">Practice</span><span v-else>Play Again</span>
              </button>
            </span>
          </div>
        </Transition>
        <header>
            <h1 class="game-header">
              <GameHeader
                :daily="daily"
                :cookie="this.cookie"
                @change="this.cookieChange"
              >
                RIT BAJA-DLE
              </GameHeader>
            </h1>
        </header>
        <div id="board" :class="[`rows-${numGuesses}`]">
            <div
                v-for="(row, index) in board"
                :key="`row ${index}`"
                :class="[
                    'row',
                    shakeRowIndex === index && 'shake',
                    success && currentRowIndex === index && 'jump',
                    `t${word.length}`
                ]"
            >
                <div
                    v-for="(tile, subindex) in row"
                    :key="`row ${index} tile ${subindex}`"
                    :class="[
                      'tile',
                      cookie.nightMode && 'nightMode',
                      tile.letter.length > 0 && 'filled',
                      tile.state.name !== 'initial' && 'revealed'
                    ]"
                >
                    <div
                      :class="[
                        'front',
                        cookie.nightMode && 'nightMode',
                        `d${subindex}`,
                        success && currentRowIndex == index && 'hideTile'
                      ]"
                    >
                        {{ tile.letter }}
                    </div>
                    <div
                        :class="['back', tile.state.name, `d${subindex}`]"
                    >
                        {{ tile.letter }}
                    </div>
                </div>
            </div>
        </div>
        <Keyboard @key="onKey" :letterStates="letterStates" />
        <textarea id="copy-text">a</textarea>
    </div>
</template>

<script>
import getWordList from '../js/words'
import Keyboard from '../components/Keyboard'
import GameHeader from '../components/GameHeader'
import random from '../js/random'
import properties from '../js/game'
import getValidWordList from '../js/valid-words'

const LetterState = {
  CORRECT: {icon: '🟩', name: 'correct'},
  PRESENT: {icon: '🟨', name: 'present'},
  ABSENT: {icon: '⬛', name: 'absent'},
  INITIAL: {icon: null, name: 'initial'}
}

const COOKIE_KEY = "BAJADLE-COOKIE"

export default {
    components: {
        Keyboard,
        GameHeader
    },
    props: {
      daily: Boolean
    },
    data () {
        return {
            msg: {message: "", showMessage: false, index: 0, showEndBlurb: false},
            shakeRowIndex: -1,
            currentRowIndex: 0,
            success: false,
            board: [],
            allowInput: true,
            letterStates: {Backspace: LetterState.INITIAL, Enter: LetterState.INITIAL},
            showSettings: true,
            cookie: {
              nightMode: false,
              numTimesPlayed: 0,
              numTimesWon: 0,
              lastGamePlayed: -5,
              currentStreak: 0,
              maxStreak: 0,
              practice_disallowSlang: false,
              practice_disallowCompanies: false,
              practice_disallowNames: false,
              practice_disallowGeneral: false,
              practice_disallowTechnical: false,
              settingsString: ''
            },
            bodyNightMode: false
        }
    },
    computed: {
        word() {
            let days = random.getDaysSinceStart().toString()
            let wordList = getWordList(this.daily)
            let index = random.getTodaysIndex(wordList.length)
            if (!this.daily) {
              index = random.getRandomIndex(wordList.length)
            }
            return wordList[index]
        },
        wordList() {
          return getValidWordList(this.daily, this.word.length)
        },
        numGuesses() {
          return properties.getNumGuesses(this.word.length)
        }
    },
    created () {
        this.board =
          Array.from({ length: this.numGuesses }, () => 
            Array.from({ length: this.word.length }, () => ({
              letter: '',
              state: LetterState.INITIAL
            }))
          )
        for (let i = 0; i < 26; i++) {
          this.$set(this.letterStates, String.fromCharCode(97 + i), LetterState.INITIAL)
        }

        const onKeyup = e => this.onKey(e.key)
        window.addEventListener('keyup', onKeyup)
    },
    mounted () {
        if (this.$cookies.isKey(COOKIE_KEY)) {
          let c = this.$cookies.get(COOKIE_KEY)
          let self = this
          Object.keys(c).forEach(key => {
            self.$set(self.cookie, key, c[key])
          })
        }
        this.$cookies.set(COOKIE_KEY, this.cookie)
          this.$emit("setBkg", this.cookie.nightMode)
    },
    methods: {
        cookieChange() {
          this.$cookies.set(COOKIE_KEY, this.cookie)
          this.$emit("setBkg", this.cookie.nightMode)
        },
        getDelayString(index, k) {
          return `${index * 100 * k}ms`
        },
        goToInfinite() {
          window.location = "https://seidman-ad.am/game-infinite"
        },
        showMessage(msg, time, showEndBlurb) {
            if (time === void 0) { time = 1000; }
            if (!Array.isArray(msg)) {
              msg = [msg]
            }
            this.msg.message = msg;
            this.msg.index += 1
            let index = this.msg.index
            this.$set(this.msg, 'showMessage', true)
            this.$set(this.msg, 'showEndBlurb', showEndBlurb === true)
            let self = this
            if (time > 0) {
                setTimeout(function () {
                    if (self.msg.index == index) {
                        self.$set(self.msg, 'showMessage', false)
                    }
                }, time);
            }
        },
        onKey(key) {
          if (!this.allowInput) {
            return
          }
          if (/^[a-zA-Z]$/.test(key)) {
            this.fillTile(key.toLowerCase())
          } else if (key === 'Backspace') {
            this.clearTile()
          } else if (key === 'Enter') {
            this.completeRow()
          }
        },
        fillTile(letter) {
          for (const tile of this.board[this.currentRowIndex]) {
            if (!tile.letter) {
              tile.letter = letter
              break
            }
          }
        },
        clearTile() {
          for (const tile of [...this.board[this.currentRowIndex]].reverse()) {
            if (tile.letter) {
              tile.letter = ''
              break
            }
          }
        },
        completeRow() {
          if (this.board[this.currentRowIndex].every(tile => tile.letter)) {
            const guess = this.board[this.currentRowIndex].map(tile => tile.letter).join('').toLowerCase()
            if (!this.isValidWord(guess)) {
              this.shake()
              this.showMessage('Not in word list')
              return
            }
            const answerLetters = this.word.toLowerCase().split('')
            // Greens
            this.board[this.currentRowIndex].forEach((tile, i) => {
              if (answerLetters[i] === tile.letter) {
                tile.state = LetterState.CORRECT
                this.$set(this.letterStates, tile.letter, LetterState.CORRECT)
                answerLetters[i] = null
              }
            })
            // Yellows
            this.board[this.currentRowIndex].forEach(tile => {
              if (tile.state.name === LetterState.INITIAL.name && answerLetters.includes(tile.letter)) {
                tile.state = LetterState.PRESENT
                answerLetters[answerLetters.indexOf(tile.letter)] = null
                if (this.letterStates[tile.letter].name === LetterState.INITIAL.name) {
                  this.$set(this.letterStates, tile.letter, LetterState.PRESENT)
                }
              }
            })
            // GRAYS
            this.board[this.currentRowIndex].forEach(tile => {
              if (tile.state.name === LetterState.INITIAL.name) {
                tile.state = LetterState.ABSENT
                if (this.letterStates[tile.letter].name === LetterState.INITIAL.name) {
                  this.$set(this.letterStates, tile.letter, LetterState.ABSENT)
                }
              }
            })

            this.allowInput = false
            if (this.board[this.currentRowIndex].every(tile => tile.state.name === LetterState.CORRECT.name)) {
              let self = this
              setTimeout(() => {
                self.showMessage([
                    'Genius',
                    'Magnificent',
                    'Impressive',
                    'Splendid',
                    'Great',
                    'Phew',
                    'Good Enough...',
                    'Okay',
                    'Okay',
                    'Okay'
                  ][this.currentRowIndex])
                self.success = true
                setTimeout(() => {
                  self.showMessage('CONGRATULATIONS!', -1, true)
                }, (100 * this.word.length) + 1200)
              }, (300 * this.word.length) + 50)
            } else if (this.currentRowIndex < this.board.length - 1) {
              this.currentRowIndex++
              let self = this
              setTimeout(() => {
                self.allowInput = true
              }, 250)
            } else {
              this.showMessage(['GAME OVER', ' ', `The word was ${this.word.toUpperCase()}`], -1, true)
            }
          } else {
            this.shake()
            this.showMessage("Not enough letters")
          }
        },
        isValidWord(word) {
          return this.wordList.includes(word.toUpperCase())
        },
        shake() {
          this.shakeRowIndex = this.currentRowIndex
          let self = this
          setTimeout(() => {
            self.shakeRowIndex = -1
          }, 1000)
        },
        copyResultGrid() {
          let numTries = this.currentRowIndex + 1
          if (!this.success) {
            numTries = 'X'
          }
          let typeBlurb = random.getDaysSinceStart()
          if (!this.daily) {
            typeBlurb = `Practice: ${this.word.toUpperCase()}`
          }
          let grid = `RIT Baja-dle ${typeBlurb} ${numTries}/${this.numGuesses}\n`
          grid += this.board.slice(0, this.currentRowIndex + 1).map(row => {
            return row.map(tile => tile.state.icon).join('')
          }).join('\n')
          this.copyText(grid)
        },
        copyText(text) {
          navigator.clipboard.writeText(text)
          const smartTA = document.getElementById("copy-text")
          smartTA.innerHTML = text
          smartTA.select()
          document.execCommand("Copy")
          alert('Copied!')
        }
    }
}
</script>

<style>
textarea#copy-text {
  opacity: 0;
  position: absolute;
  font-size: 1px;
}

.hideTile {
  opacity: 0;
}

h1.game-header {
  margin: 4px 0;
  font-size: 36px;
}

header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 30px;
  position: relative;
}

#source-link {
  position: absolute;
  right: 1em;
  top: 0.5em;
}

.correct,
.present,
.absent {
  color: #fff !important;
}

.correct {
  background-color: #6aaa64 !important;
}

.nightMode .correct {
  background-color: #577E47 !important;
}

.present {
  background-color: #c9b458 !important;
}

.nightMode .present {
  background-color: #675B1F !important;
}

.absent {
  background-color: #787c7e !important;
}

.nightMode .absent {
  background-color: #2F3336 !important;
}

.message {
  position: absolute;
  left: 50%;
  top: 80px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.85);
  padding: 16px 20px;
  z-index: 2;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease-out;
  font-weight: 600;
}

.message.v-leave-to {
  opacity: 0;
}

.nightMode .key {
  background-color: #5C6466;
  color: white;
}

.d0 {
  transition-delay: 0ms !important;
}
.d1 {
  transition-delay: 300ms !important;
}
.d2 {
  transition-delay: 600ms !important;
}
.d3 {
  transition-delay: 900ms !important;
}
.d4 {
  transition-delay: 1200ms !important;
}
.d5 {
  transition-delay: 1500ms !important;
}
.d6 {
  transition-delay: 1800ms !important;
}
.d7 {
  transition-delay: 2100ms !important;
}
.d8 {
  transition-delay: 2400ms !important;
}

.d0.back {
  animation-delay: 0ms !important;
}
.d1.back {
  animation-delay: 100ms !important;
}
.d2.back {
  animation-delay: 200ms !important;
}
.d3.back {
  animation-delay: 300ms !important;
}
.d4.back {
  animation-delay: 400ms !important;
}
.d5.back {
  animation-delay: 500ms !important;
}
.d6.back {
  animation-delay: 600ms !important;
}
.d7.back {
  animation-delay: 700ms !important;
}
.d8.back {
  animation-delay: 800ms !important;
}

#board {
  display: grid;
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
  --height: min(420px, calc(var(--vh, 100vh) - 310px));
  height: var(--height);
  width: min(350px, calc(var(--height) / 6 * 5));
  margin: 0px auto;
}

#board.guesses-5 {
  grid-template-rows: repeat(5, 1fr);
}
#board.guesses-6 {
  grid-template-rows: repeat(6, 1fr);
}
#board.guesses-7 {
  grid-template-rows: repeat(7, 1fr);
}
#board.guesses-8 {
  grid-template-rows: repeat(8, 1fr);
}
#board.guesses-9 {
  grid-template-rows: repeat(9, 1fr);
}
#board.guesses-10 {
  grid-template-rows: repeat(10, 1fr);
}

.row {
  display: grid;
  grid-gap: 5px;
}
.row.t4 {
  grid-template-columns: repeat(4, 1fr);
}
.row.t5 {
  grid-template-columns: repeat(5, 1fr);
}
.row.t6 {
  grid-template-columns: repeat(6, 1fr);
}
.row.t7 {
  grid-template-columns: repeat(7, 1fr);
}
.row.t8 {
  grid-template-columns: repeat(8, 1fr);
}
.row.t9 {
  grid-template-columns: repeat(9, 1fr);
}
.tile {
  width: 100%;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}
.tile.filled {
  animation: zoom 0.2s;
}
.tile .front,
.tile .back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.tile .front {
  border: 2px solid #d3d6da;
}
.tile.filled .front {
  border-color: #999;
}
.tile .front.nightMode {
  border-color: #363B3E;
  color: #DDD;
}
.tile.filled .front.nightMode {
  border-color: #878C8F;
}
.tile .back {
  transform: rotateX(180deg);
}
.tile.revealed .front {
  transform: rotateX(180deg);
}
.tile.revealed .back {
  transform: rotateX(0deg);
}

@keyframes zoom {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(1px);
  }
  10% {
    transform: translate(-2px);
  }
  20% {
    transform: translate(2px);
  }
  30% {
    transform: translate(-2px);
  }
  40% {
    transform: translate(2px);
  }
  50% {
    transform: translate(-2px);
  }
  60% {
    transform: translate(2px);
  }
  70% {
    transform: translate(-2px);
  }
  80% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(1px);
  }
}

.jump .tile .back {
  animation: jump 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  20% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-25px);
  }
  90% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-height: 680px) {
  .tile {
    font-size: 3vh;
  }
}

div.game-container {
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
  max-width: 500px;
  margin: 0px auto;
}

div.game-container.nightMode {
  background-color: #1E2021;
}
</style>
