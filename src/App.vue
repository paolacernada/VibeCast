<template>
  <MainHeader />
  <div class="content">
    <router-view></router-view>
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

header {
  line-height: 1.2;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

body {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    overflow: hidden;
}

</style>
