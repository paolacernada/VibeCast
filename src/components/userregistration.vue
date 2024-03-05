<!-- userregistration.vue -->
<template>
  <div class="user-registration">
    <div>
      <button @click="setActiveSection('signUp')" :class="{ active: activeSection === 'signUp' }">Sign Up</button>
      <button @click="setActiveSection('login')" :class="{ active: activeSection === 'login' }">Login</button>
    </div>

    <div v-if="activeSection === 'signUp'">
      <h2>Sign Up</h2>
      <form @submit.prevent="signUp">
        <label>Name:</label>
        <input v-model="name" required>
        <label>Email:</label>
        <input v-model="email" required>
        <label>Password:</label>
        <input type="password" v-model="password" required>
        <label>Location:</label>
        <input v-model="location" required>
        <button type="submit">Sign Up</button>
      </form>
    </div>

    <div v-if="activeSection === 'login'">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <label>Email:</label>
        <input v-model="loginEmail" required>
        <label>Password:</label>
        <input type="password" v-model="loginPassword" required>
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'userregistration',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      zipcode: '',
      loginemail: '',
      loginpassword: '',
      activeSection: 'signUp'
    };
  },
  methods: {
    async signUp() {
      try {

        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password,
            location: this.location,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          alert(responseData.message);
          this.clearForm();
        } else {
          throw new Error('Failed to sign up');
        }
      } catch (error) {
        console.error('Error signing up:', error);
        alert('Error signing up. Please try again.' + error);
      }
    },
    async loginin() {

    },


    clearForm() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.location = '';
    },

    setActiveSection(section) {
      this.activeSection = section;
    }
  }

};
</script>

<style scoped>
.user-registration {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  margin: 10px;
  cursor: pointer;
}

form {
  display: flex;
  flex-direction: column;
  margin: 20px
}

label {
  margin-botton: 8px;
}

button[type="submit"] {
  margin-top: 10px;
}

.active {
  background-color: blue;
  color: azure;
}
</style>