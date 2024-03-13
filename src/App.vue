<template>
  <mainheader />
  <router-view></router-view>
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


<style scoped> header {
   line-height: 1.5;
 }

 header .wrapper {
   display: flex;
   place-items: flex-start;
   flex-wrap: wrap;
 }
</style>

