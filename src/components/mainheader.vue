<template>
  <header class="main-header">
    <h1>Weather Vibe</h1>
  </header>
</template>

<script>
export default {
  name: 'mainheader'
};
</script>

<style scoped>
.main-header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(80, 125, 188, 0.85);
  color: #FFFFFF;
  padding: 0.5rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease-in-out;
  max-width: 653px;
  margin: 2rem auto;
  border-radius: 6px;
  margin-top: 1%;
  margin-bottom: 0%;
}

.main-header h1 {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.8rem;
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: -0.02em;
}
</style>
