<template>
  <div class="app-wrapper">
    <MainHeader />
    <div class="content">
      <div class="bg"><router-view></router-view></div>
    </div>
  </div>
</template>

<script>
import MainHeader from './components/mainheader.vue';

export default {
  name: 'App',
  components: {
    MainHeader,
  },
  data() {
    return {
      showWeatherHome: false,
    };
  },
  methods: {
    handleLoginSuccess() {
      this.showWeatherHome = true;
    },
  }
}
</script>

<style scoped>
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.9%;
}

.bg {
  display: flex;
  justify-content: center;
  align-items: center;
}

header {
  line-height: 1.2;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

.app-wrapper {
  transform: scale(0.9);
  transform-origin: top center;
  min-height: auto;
  width: 100%;
  overflow: auto;
}
</style>
