<template>
  <div id="app" :class="nightMode && 'nightMode'">
    <router-view @setBkg="setBackground"></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      nightMode: false,
    }
  },
  created () {
    window.addEventListener("resize", this.handleResize)
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    setBackground(nightMode) {
      this.nightMode = nightMode
    },
    handleResize () {
      let el = document.getElementById('app')
      el.className = ''
      el.classList.add(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || DEBUG ? 'mobile' : 'pc')
      el.classList.add(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      if (this.nightMode) {
        el.classList.add('nightMode')
      }
    }
  }
}
</script>

<style>

body {
  margin: 0px;
  overflow-x: hidden;
  background-color: whitesmoke;
}

div#app.nightMode {
  background-color: #1E2021;
  height: 100vh;
  overflow: hidden;
}
</style>

