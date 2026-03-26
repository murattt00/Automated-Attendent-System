<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 class="text-3xl font-black text-slate-900">Forgot Password?</h2>
        <p class="mt-2 text-slate-600">No worries, we'll send you reset instructions</p>
      </div>

      <!-- Success Message -->
      <div v-if="emailSent" class="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-emerald-900 mb-1">Check your email</h3>
            <p class="text-sm text-emerald-700 leading-relaxed">
              If an account exists with <strong>{{ email }}</strong>, you will receive a password reset link shortly.
            </p>
            <p class="text-sm text-emerald-700 mt-2">
              Don't see it? Check your spam folder.
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div v-if="!emailSent" class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 p-8">
        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your.email@university.edu"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="!loading">Send Reset Link</span>
            <span v-else>Sending...</span>
          </button>
        </form>
      </div>

      <!-- Back to Login -->
      <div class="mt-6 text-center">
        <NuxtLink to="/login" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const email = ref('');
const loading = ref(false);
const error = ref('');
const emailSent = ref(false);
const config = useRuntimeConfig();

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await $fetch(`${config.public.apiBase}/api/password/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: email.value
      }
    });

    if (response.success) {
      emailSent.value = true;
    } else {
      error.value = response.message || 'Failed to send reset email';
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    error.value = err.data?.message || 'An error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
