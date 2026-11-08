<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      
      <h1 class="logo">App Auth</h1>
      <p class="subtitle">Securely manage your account</p>

      <div class="control-buttons">
        <button 
          :class="{ 'active': isLoginView }" 
          @click="isLoginView = true"
        >
          Login
        </button>

        <button 
          v-if="isRegistrationEnabled"
          :class="{ 'active': !isLoginView }" 
          @click="isLoginView = false"
        >
          Register
        </button>
      </div>

      <hr class="separator">

      <transition name="form-slide" mode="out-in">
        <form 
          v-if="isLoginView" 
          key="login" 
          @submit.prevent="handleLogin" 
          class="auth-form"
        >
          <h2>Welcome Back</h2>
          <div class="input-group">
            <input type="email" placeholder="Email Address" required>
          </div>
          <div class="input-group">
            <input type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="submit-btn">Sign In</button>
          <a href="#" class="forgot-link">Forgot Password?</a>
        </form>

        <form 
          v-else-if="!isLoginView && isRegistrationEnabled"
          key="register" 
          @submit.prevent="handleRegister" 
          class="auth-form"
        >
          <h2>Create Account</h2>
          <div class="input-group">
            <input type="text" placeholder="Full Name" required>
          </div>
          <div class="input-group">
            <input type="email" placeholder="Email Address" required>
          </div>
          <div class="input-group">
            <input type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="submit-btn register-btn">Get Started</button>
        </form>

        <div v-else key="disabled-message" class="disabled-message">
          <h2>Registration is Closed</h2>
          <p>Please use an existing account to log in.</p>
        </div>
      </transition>
    </div>

    <div class="toggle-control">
      <label>
        <input type="checkbox" v-model="isRegistrationEnabled">
        Registration is Enabled
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthCard',
  data() {
    return {
      isLoginView: true,
      // The key control to enable/disable registration
      isRegistrationEnabled: true, 
    };
  },
  methods: {
    handleLogin() {
      console.log('Login attempt...');
      alert('Login logic executed!');
    },
    handleRegister() {
      if (!this.isRegistrationEnabled) {
        alert('Registration is currently disabled.');
        return;
      }
      console.log('Register attempt...');
      alert('Register logic executed!');
    }
  },
  watch: {
    // Force switch to login if registration is disabled while on the register view
    isRegistrationEnabled(isEnabled) {
      if (!isEnabled && !this.isLoginView) {
        this.isLoginView = true;
      }
    }
  }
}
</script>

<style scoped>
/* --- 1. Layout & Card Styles (Modern Look) --- */

.auth-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 100%); /* Dark Gradient BG */
  color: #f0f0f0;
}

.auth-card {
  width: 90%;
  max-width: 400px;
  background: #2c2c2c; /* Dark Card Background */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
}

.logo {
  font-family: 'Arial Black', sans-serif;
  color: #4CAF50; /* Primary Accent Color */
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.subtitle {
  color: #aaa;
  margin-bottom: 25px;
  font-size: 0.9em;
}

/* --- 2. Form & Input Styles --- */

.auth-form {
  padding: 20px 0;
}

.auth-form h2 {
  color: #f0f0f0;
  margin-bottom: 25px;
  font-weight: 300;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 15px 20px;
  border: 1px solid #444;
  background: #333;
  color: #f0f0f0;
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-group input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.submit-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #4CAF50;
  color: white;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease, transform 0.1s ease;
}

.submit-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.forgot-link {
  display: block;
  margin-top: 15px;
  color: #aaa;
  text-decoration: none;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #4CAF50;
}

.disabled-message {
  padding: 40px 20px;
  color: #f0f0f0;
}

.disabled-message h2 {
    color: #FF5252;
}

/* --- 3. Control Button Styles (Tab-like Switch) --- */

.control-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #333;
  border-radius: 8px;
  padding: 5px;
}

.control-buttons button {
  flex-grow: 1;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #aaa;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.control-buttons button.active {
  background: #4CAF50;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
}

.separator {
  border: 0;
  height: 1px;
  background-color: #444;
  margin: 10px 0 30px 0;
}

/* Toggle Switch Control (for demo) */
.toggle-control {
  margin-top: 20px;
  padding: 15px;
  background: #2c2c2c;
  border-radius: 8px;
  color: #f0f0f0;
}


/* --- 4. Transition/Animation Styles (The WoW Factor) --- */

/* Form Slide Animation */
.form-slide-enter-active, .form-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

/* Enter Animation: Slide from right and fade in */
.form-slide-enter {
  opacity: 0;
  transform: translateX(20px);
}

/* Leave Animation: Slide to left and fade out */
.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Keyframe for subtle input shake on required field */
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.input-group input:invalid:focus {
  /* Apply subtle shake for invalid fields on submit (requires more JS for true UX) */
  /* animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; */
  border-color: #FF5252; /* Red border for error state */
}

</style><template>
  <div class="auth-wrapper">
    <div class="auth-card">
      
      <h1 class="logo">App Auth</h1>
      <p class="subtitle">Securely manage your account</p>

      <div class="control-buttons">
        <button 
          :class="{ 'active': isLoginView }" 
          @click="isLoginView = true"
        >
          Login
        </button>

        <button 
          v-if="isRegistrationEnabled"
          :class="{ 'active': !isLoginView }" 
          @click="isLoginView = false"
        >
          Register
        </button>
      </div>

      <hr class="separator">

      <transition name="form-slide" mode="out-in">
        <form 
          v-if="isLoginView" 
          key="login" 
          @submit.prevent="handleLogin" 
          class="auth-form"
        >
          <h2>Welcome Back</h2>
          <div class="input-group">
            <input type="email" placeholder="Email Address" required>
          </div>
          <div class="input-group">
            <input type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="submit-btn">Sign In</button>
          <a href="#" class="forgot-link">Forgot Password?</a>
        </form>

        <form 
          v-else-if="!isLoginView && isRegistrationEnabled"
          key="register" 
          @submit.prevent="handleRegister" 
          class="auth-form"
        >
          <h2>Create Account</h2>
          <div class="input-group">
            <input type="text" placeholder="Full Name" required>
          </div>
          <div class="input-group">
            <input type="email" placeholder="Email Address" required>
          </div>
          <div class="input-group">
            <input type="password" placeholder="Password" required>
          </div>
          <button type="submit" class="submit-btn register-btn">Get Started</button>
        </form>

        <div v-else key="disabled-message" class="disabled-message">
          <h2>Registration is Closed</h2>
          <p>Please use an existing account to log in.</p>
        </div>
      </transition>
    </div>

    <div class="toggle-control">
      <label>
        <input type="checkbox" v-model="isRegistrationEnabled">
        Registration is Enabled
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthCard',
  data() {
    return {
      isLoginView: true,
      // The key control to enable/disable registration
      isRegistrationEnabled: true, 
    };
  },
  methods: {
    handleLogin() {
      console.log('Login attempt...');
      alert('Login logic executed!');
    },
    handleRegister() {
      if (!this.isRegistrationEnabled) {
        alert('Registration is currently disabled.');
        return;
      }
      console.log('Register attempt...');
      alert('Register logic executed!');
    }
  },
  watch: {
    // Force switch to login if registration is disabled while on the register view
    isRegistrationEnabled(isEnabled) {
      if (!isEnabled && !this.isLoginView) {
        this.isLoginView = true;
      }
    }
  }
}
</script>

<style scoped>
/* --- 1. Layout & Card Styles (Modern Look) --- */

.auth-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 100%); /* Dark Gradient BG */
  color: #f0f0f0;
}

.auth-card {
  width: 90%;
  max-width: 400px;
  background: #2c2c2c; /* Dark Card Background */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
}

.logo {
  font-family: 'Arial Black', sans-serif;
  color: #4CAF50; /* Primary Accent Color */
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.subtitle {
  color: #aaa;
  margin-bottom: 25px;
  font-size: 0.9em;
}

/* --- 2. Form & Input Styles --- */

.auth-form {
  padding: 20px 0;
}

.auth-form h2 {
  color: #f0f0f0;
  margin-bottom: 25px;
  font-weight: 300;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 15px 20px;
  border: 1px solid #444;
  background: #333;
  color: #f0f0f0;
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-group input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.submit-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #4CAF50;
  color: white;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease, transform 0.1s ease;
}

.submit-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.forgot-link {
  display: block;
  margin-top: 15px;
  color: #aaa;
  text-decoration: none;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #4CAF50;
}

.disabled-message {
  padding: 40px 20px;
  color: #f0f0f0;
}

.disabled-message h2 {
    color: #FF5252;
}

/* --- 3. Control Button Styles (Tab-like Switch) --- */

.control-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #333;
  border-radius: 8px;
  padding: 5px;
}

.control-buttons button {
  flex-grow: 1;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #aaa;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.control-buttons button.active {
  background: #4CAF50;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
}

.separator {
  border: 0;
  height: 1px;
  background-color: #444;
  margin: 10px 0 30px 0;
}

/* Toggle Switch Control (for demo) */
.toggle-control {
  margin-top: 20px;
  padding: 15px;
  background: #2c2c2c;
  border-radius: 8px;
  color: #f0f0f0;
}


/* --- 4. Transition/Animation Styles (The WoW Factor) --- */

/* Form Slide Animation */
.form-slide-enter-active, .form-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

/* Enter Animation: Slide from right and fade in */
.form-slide-enter {
  opacity: 0;
  transform: translateX(20px);
}

/* Leave Animation: Slide to left and fade out */
.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Keyframe for subtle input shake on required field */
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.input-group input:invalid:focus {
  /* Apply subtle shake for invalid fields on submit (requires more JS for true UX) */
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; 
  border-color: #FF5252; /* Red border for error state */
}

</style>