<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-3xl font-black text-slate-900">Set New Password</h2>
        <p class="mt-2 text-slate-600">Enter your new password below</p>
      </div>

      <!-- Success Message -->
      <div v-if="resetSuccess" class="bg-white rounded-3xl shadow-xl shadow-emerald-100/50 border border-emerald-100 p-8">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful!</h3>
          <p class="text-slate-600 mb-6">Your password has been updated successfully.</p>
          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            Go to Login
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Invalid Token Message -->
      <div v-else-if="invalidToken" class="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-100 p-8">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Invalid or Expired Link</h3>
          <p class="text-slate-600 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
          <NuxtLink
            to="/forgot-password"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            Request New Link
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Reset Form -->
      <div v-else class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 p-8">
        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              required
              placeholder="Enter new password"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            
            <!-- Password Requirements -->
            <div class="mt-3 space-y-2">
              <div class="flex items-center gap-2 text-sm" :class="passwordChecks.length ? 'text-emerald-600' : 'text-slate-400'">
                <span>{{ passwordChecks.length ? '✓' : '○' }}</span>
                <span>At least 8 characters</span>
              </div>
              <div class="flex items-center gap-2 text-sm" :class="passwordChecks.uppercase ? 'text-emerald-600' : 'text-slate-400'">
                <span>{{ passwordChecks.uppercase ? '✓' : '○' }}</span>
                <span>One uppercase letter</span>
              </div>
              <div class="flex items-center gap-2 text-sm" :class="passwordChecks.lowercase ? 'text-emerald-600' : 'text-slate-400'">
                <span>{{ passwordChecks.lowercase ? '✓' : '○' }}</span>
                <span>One lowercase letter</span>
              </div>
              <div class="flex items-center gap-2 text-sm" :class="passwordChecks.number ? 'text-emerald-600' : 'text-slate-400'">
                <span>{{ passwordChecks.number ? '✓' : '○' }}</span>
                <span>One number</span>
              </div>
              <div class="flex items-center gap-2 text-sm" :class="passwordChecks.special ? 'text-emerald-600' : 'text-slate-400'">
                <span>{{ passwordChecks.special ? '✓' : '○' }}</span>
                <span>One special character</span>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              placeholder="Confirm new password"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-2 text-sm text-red-600">
              Passwords do not match
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || !isPasswordValid || newPassword !== confirmPassword"
            class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="!loading">Reset Password</span>
            <span v-else>Resetting...</span>
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
const route = useRoute();
const config = useRuntimeConfig();

const token = ref(route.query.token || '');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const resetSuccess = ref(false);
const invalidToken = ref(false);

// Password validation checks
const passwordChecks = computed(() => ({
  length: newPassword.value.length >= 8,
  uppercase: /[A-Z]/.test(newPassword.value),
  lowercase: /[a-z]/.test(newPassword.value),
  number: /[0-9]/.test(newPassword.value),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value)
}));

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks.value).every(check => check === true);
});

// Verify token on mount
onMounted(async () => {
  if (!token.value) {
    invalidToken.value = true;
    return;
  }

  // Optional: Verify token validity
  try {
    await $fetch(`${config.public.apiBase}/api/password/verify-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        token: token.value
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    invalidToken.value = true;
  }
});

const handleSubmit = async () => {
  if (!isPasswordValid.value) {
    error.value = 'Please meet all password requirements';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const response = await $fetch(`${config.public.apiBase}/api/password/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        token: token.value,
        newPassword: newPassword.value
      }
    });

    if (response.success) {
      resetSuccess.value = true;
    } else {
      error.value = response.message || 'Failed to reset password';
    }
  } catch (err) {
    console.error('Reset password error:', err);
    error.value = err.data?.message || 'An error occurred. Please try again.';
    
    if (err.status === 400) {
      invalidToken.value = true;
    }
  } finally {
    loading.value = false;
  }
};
</script>
