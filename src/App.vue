<template>
  <mainheader />
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
}

header {
  line-height: 1.5;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}
</style>
