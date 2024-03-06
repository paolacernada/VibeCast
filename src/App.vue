<template>
  <mainheader />
  <userregistration v-if="!showWeatherHome" @login-success="handleLoginSuccess" />
  <weatherhome v-if="showWeatherHome" />
</template>


<script>
import mainheader from './components/mainheader.vue';
import userregistration from './components/userregistration.vue';
import weatherhome from './components/weatherhome.vue';


export default {
  name: 'App',
  components: {
    mainheader,
    userregistration,
    weatherhome,
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

