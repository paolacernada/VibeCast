<!-- userregistration.vue -->
<template>
  <div class="user-registration">
    <div>
      <button @click="setActiveSection('signUp')" :class="{ active: activeSection === 'signUp' }">Sign Up</button>
      <button @click="setActiveSection('login')" :class="{ active: activeSection === 'login' }">Login</button>
    </div>

    <div v-if="activeSection === 'signUp'">
      <form @submit.prevent="signUp">
        <label>Name:</label>
        <input v-model="name" required>
        <label>Email:</label>
        <input v-model="email" required>
        <label>Password:</label>
        <input type="password" v-model="password" required>
        <label>Location:</label>
        <input v-model="location" required>
        <button type="submit">Register</button>
      </form>
    </div>

    <div v-if="activeSection === 'login'">
      <form @submit.prevent="login">
        <label>Email:</label>
        <input v-model="loginEmail" required>
        <label>Password:</label>
        <input type="password" v-model="loginPassword" required>
        <button type="submit">Sign In</button>
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
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
      alert(responseData.message); // Show the alert with the success message
      this.setActiveSection('login'); // Change to login section after the alert is dismissed
      this.clearForm(); // Optionally clear the form fields
    } else {
      throw new Error('Failed to sign up');
    }
  } catch (error) {
    console.error('Error signing up:', error);
    alert('Error signing up. Please try again.' + error);
  }
},

    async login() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.loginEmail,
            password: this.loginPassword,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          alert(responseData.message);
          localStorage.setItem('isAuthenticated', 'true');
          this.$router.push('/weather'); // Redirect to WeatherHome after login

          if (responseData.message === 'User logged in successfully') {
            this.$emit('login-success');
            console.log('Emitted the message to the parent')
          }
        } else {
          throw new Error('Failed to Login');
        }
      } catch (error) {
        console.error('Error Logging in:', error);
        alert('Error Logging in. Please try again.' + error);
      }
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
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #F0F2F5;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  color: #1C1E21;
}

button {
  padding: 0.75rem 1rem;
  margin: 0 5px;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #4267B2;
  background-color: transparent;
  transition: color 0.3s, border-color 0.3s;
}

button:hover {
  color: #365899;
  border-bottom: 2px solid #365899;
}

.active {
  border-bottom: 2px solid #4267B2;
  color: #4267B2;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

button[type="submit"] {
  margin-top: 10px;
  background-color: #4267B2;
  color: white;
  border-radius: 6px;
}

button[type="submit"]:hover {
  background-color: #365899;
  transform: translateY(-2px);
}

input {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 2px solid #4267B2;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}
</style>
