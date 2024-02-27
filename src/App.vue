<template>
  <mainheader />
  <userregistration />
</template>


<script>
import mainheader from './components/mainheader.vue';
import userregistration from './components/userregistration.vue';

export default {
  name: 'App',
  components: {
    mainheader,
    userregistration
  }
}
</script>


<style scoped> header {
   line-height: 1.5;
 }

 header .wrapper {
   display: flex;
   place-items: felx-start;
   flex-wrap: wrap;
 }
</style>

