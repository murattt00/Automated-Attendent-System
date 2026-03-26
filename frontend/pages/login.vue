<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">University Attendance</h1>
        <p class="text-gray-600">Sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your.email@university.edu"
            class="input-field"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-semibold text-gray-700">Password</label>
            <NuxtLink to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </NuxtLink>
          </div>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="input-field"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Sign In</span>
          <span v-else>Signing in...</span>
        </button>
      </form>

      <!-- Error Messages -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm font-semibold mb-2">❌ Giriş Başarısız</p>
        <p class="text-red-700 text-sm whitespace-pre-line">{{ error }}</p>
      </div>

      <p class="text-center text-gray-600 text-sm mt-6">
        Don't have an account?
        <NuxtLink to="/register" class="text-blue-600 font-semibold hover:underline">
          Register
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const { login, isAuthenticated, isTeacher } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const result = await login(email.value, password.value);

  if (result.success) {
    // Redirect based on role
    router.push(isTeacher.value ? '/teacher' : '/student');
  } else {
    error.value = result.message || 'Login failed';
  }

  loading.value = false;
};
</script>
