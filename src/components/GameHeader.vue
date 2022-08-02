<template>
    <span :class="['full-settings', cookie.nightMode && 'nightMode']">
        <font-awesome-icon :icon="['fa', 'share']" :class="['redirect-arrow', this.daily && 'daily', cookie.nightMode && 'nightMode']" @click="setWindow()" />
        <font-awesome-icon v-if="daily" :icon="['fa', 'infinity']" :class="['infinity', 'icon', cookie.nightMode && 'nightMode']" @click="setWindow()" />
        <font-awesome-icon v-else :icon="['fa', 'calendar']" :class="['calendar', 'icon', cookie.nightMode && 'nightMode']" @click="setWindow()" />
        <slot></slot>
        <font-awesome-icon :icon="['fa', 'cog']" :class="['cog', 'icon', cookie.nightMode && 'nightMode']" @click="toggleModal()" />
        <div class="message settings-panel" v-if="this.showSettings">
            Settings
            <hr>
            <span v-if="!daily">
                <switches @input="emitProps" :emit-on-mount="false" v-model="generic" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Allow Generic Terms</span><br>

                <switches @input="emitProps" :emit-on-mount="false" v-model="technical" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Allow Car Parts/Systems</span><br>

                <switches @input="emitProps" :emit-on-mount="false" v-model="names" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Allow Names/Nicknames</span><br>

                <switches @input="emitProps" :emit-on-mount="false" v-model="companies" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Allow Companies/Sponsors</span><br>

                <switches @input="emitProps" :emit-on-mount="false" v-model="slang" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Allow Baja Slang</span><br>
                <hr>
            </span>
            <span>
                <switches @input="emitProps" :emit-on-mount="false" v-model="nightMode" theme="bulma" color="default" />
                <span class="switch-text">&nbsp;Dark Theme</span><br>
            </span>
        </div>
    </span>
</template>

<script>
import Switches from 'vue-switches'

export default {
    components: {
        Switches
    },
    props: {
      daily: Boolean,
      cookie: Object
    },
    data() {
        return {
            showSettings: false,
            lastToggle: 0,
            nightMode: false,
            companies: true,
            generic: true,
            technical: true,
            slang: true,
            names: true
        }
    },
    computed: {
        extension () {
            if (this.daily) {
                return 'game-infinite'
            }
            return 'game'
        }
    },
    methods: {
        updateCookieObject() {
            this.nightMode = this.cookie.nightMode
            this.companies = !this.cookie.practice_disallowCompanies
            this.technical = !this.cookie.practice_disallowTechnical
            this.names = !this.cookie.practice_disallowNames
            this.generic = !this.cookie.practice_disallowGeneral
            this.slang = !this.cookie.practice_disallowSlang
        },
        closeModalIfOpen() {
            if (Date.now() - 50 > this.lastToggle && this.showSettings) {
                this.toggleModal()
                // TODO
            }
        },
        toggleModal() {
            this.lastToggle = Date.now()
            this.showSettings = !this.showSettings
            if (this.showSettings) {
                this.updateCookieObject();
            }
        },
        setWindow() {
            window.location = "https://seidman-ad.am/" + this.extension
        },
        emitProps() {
            this.$set(this.cookie, 'nightMode', this.nightMode)
            this.$set(this.cookie, 'practice_disallowCompanies', !this.companies)
            this.$set(this.cookie, 'practice_disallowTechnical', !this.technical)
            this.$set(this.cookie, 'practice_disallowNames', !this.names)
            this.$set(this.cookie, 'practice_disallowGeneral', !this.generic)
            this.$set(this.cookie, 'practice_disallowSlang', !this.slang)
            this.$emit("change")
        }
    }
}
</script>

<style scoped>
.full-settings.nightMode {
    color: #DDD;
}

div.message.settings-panel span.switch-text {
    font-size: 20px;
}

div.message.settings-panel span {
    white-space: nowrap;
}

.redirect-arrow {
    position: absolute;
    transform: rotate(315deg);
    font-size: 8px;
    color: #444;
    padding-top: 36px;
    padding-left: 5px;
    cursor: pointer;
}

.redirect-arrow.daily {
    padding-left: 11px;
}

.redirect-arrow.nightMode,
.icon.nightMode {
    color: #AAA;
}

.icon {
    font-size: 20px;
    cursor: pointer;
    color: #444;
    padding-bottom: 3px;
}

.cog {
    padding-left: 20px;
}

.infinity, .calendar {
    padding-right: 21px;
}
</style>