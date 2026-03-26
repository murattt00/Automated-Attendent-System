<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p class="text-gray-600">Join the attendance system</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="John Doe"
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="your.email@university.edu"
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Role</label>
          <select v-model="form.role" required class="input-field">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div v-if="form.role === 'student'">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Student Number</label>
          <input
            v-model="form.student_no"
            type="text"
            :required="form.role === 'student'"
            placeholder="2024001"
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="input-field"
            @input="checkPasswordStrength"
          />
          <!-- Password Requirements -->
          <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <p class="font-semibold text-blue-900 mb-2">📋 Şifre Gereksinimleri:</p>
            <ul class="space-y-1 text-blue-800">
              <li :class="passwordChecks.length ? 'text-green-600' : ''">
                {{ passwordChecks.length ? '✓' : '○' }} En az 8 karakter
              </li>
              <li :class="passwordChecks.uppercase ? 'text-green-600' : ''">
                {{ passwordChecks.uppercase ? '✓' : '○' }} En az 1 büyük harf (A-Z)
              </li>
              <li :class="passwordChecks.lowercase ? 'text-green-600' : ''">
                {{ passwordChecks.lowercase ? '✓' : '○' }} En az 1 küçük harf (a-z)
              </li>
              <li :class="passwordChecks.number ? 'text-green-600' : ''">
                {{ passwordChecks.number ? '✓' : '○' }} En az 1 rakam (0-9)
              </li>
              <li :class="passwordChecks.special ? 'text-green-600' : ''">
                {{ passwordChecks.special ? '✓' : '○' }} En az 1 özel karakter (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Register</span>
          <span v-else>Creating account...</span>
        </button>
      </form>

      <!-- Error Messages -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm font-semibold mb-2">❌ Kayıt Başarısız</p>
        <p class="text-red-700 text-sm whitespace-pre-line">{{ error }}</p>
      </div>

      <p class="text-center text-gray-600 text-sm mt-6">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 font-semibold hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const { register, isAuthenticated, isTeacher } = useAuth();

const form = ref({
  name: '',
  email: '',
  password: '',
  student_no: '',
  role: 'student'
});

const loading = ref(false);
const error = ref('');

// Password strength checking
const passwordChecks = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
});

const checkPasswordStrength = () => {
  const pwd = form.value.password;
  passwordChecks.value = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*]/.test(pwd)
  };
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  const result = await register(form.value);

  if (result.success) {
    router.push(isTeacher.value ? '/teacher' : '/student');
  } else {
    error.value = result.message || 'Registration failed';
  }

  loading.value = false;
};
</script>
