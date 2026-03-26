<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-white/80 border-t border-slate-200 px-4 py-3 shadow-lg">
      <div class="flex justify-around items-center">
        <button class="flex flex-col items-center gap-1 text-indigo-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs font-medium">Home</span>
        </button>
        <button @click="showCreateModal = true" class="flex flex-col items-center gap-1 text-slate-400">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-200">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span class="text-xs font-medium text-white opacity-0">Create</span>
        </button>
        <button @click="handleLogout" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Command Center
            </h1>
            <p class="text-lg text-slate-600">{{ user?.name }}</p>
          </div>
          <button @click="handleLogout" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <!-- Stats Cards (Bento Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <!-- Total Classes -->
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ classes.length }}</div>
          <div class="text-sm text-slate-500">Total Classes</div>
        </div>

        <!-- Active Sessions -->
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ activeSessions.length }}</div>
          <div class="text-sm text-slate-500">Active Sessions</div>
        </div>

        <!-- Total Students -->
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-violet-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ totalStudents }}</div>
          <div class="text-sm text-slate-500">Total Students</div>
        </div>
      </div>

      <!-- My Classes Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">My Classes</h2>
          <div class="flex gap-3">
            <NuxtLink to="/teacher/analytics" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </NuxtLink>
            <button @click="showCreateModal = true" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Class
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="flex justify-center py-12">
          <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="classes.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-xl shadow-indigo-100/50">
          <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">No classes yet</h3>
          <p class="text-slate-500 mb-6">Create your first class to start taking attendance</p>
          <button @click="showCreateModal = true" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create First Class
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="cls in classes"
            :key="cls.id"
            class="group relative bg-white rounded-3xl shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden border border-slate-100"
          >
            <!-- Gradient Header -->
            <div class="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-6 relative overflow-hidden">
              <!-- Decorative circles -->
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
              
              <div class="relative z-10">
                <div class="text-white/80 text-sm font-medium mb-1">Course Code</div>
                <div class="text-4xl font-bold text-white tracking-tight">{{ cls.code }}</div>
              </div>
            </div>

            <!-- Class Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-4 line-clamp-2 min-h-[3.5rem]">{{ cls.name }}</h3>
              
              <!-- Action Buttons -->
              <div class="space-y-3">
                <button @click="startSession(cls.id)" class="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Session
                </button>
                
                <NuxtLink
                  :to="`/teacher/class/${cls.id}`"
                  class="w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View History
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Sessions Alert -->
      <div v-if="activeSessions.length > 0" class="mb-8">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-2xl shadow-emerald-200">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-white">{{ activeSessions.length }} Active Session{{ activeSessions.length > 1 ? 's' : '' }}</h3>
              <p class="text-emerald-100 text-sm">Students are waiting to check in</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="session in activeSessions"
              :key="session.id"
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex justify-between items-center"
            >
              <div>
                <h4 class="text-lg font-semibold text-white">{{ session.class_name }}</h4>
                <p class="text-sm text-emerald-100">Started {{ formatTime(session.start_time) }}</p>
              </div>
              <NuxtLink
                :to="`/teacher/session/${session.id}`"
                class="px-6 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                View Session →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Class Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <!-- Close button -->
        <button @click="showCreateModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Create New Class</h3>
          <p class="text-slate-500">Set up a new course for attendance tracking</p>
        </div>
        
        <form @submit.prevent="createClass" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Class Name</label>
            <input
              v-model="newClass.name"
              type="text"
              required
              placeholder="e.g., Introduction to Computer Science"
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Class Code</label>
            <input
              v-model="newClass.code"
              type="text"
              required
              placeholder="e.g., CS101"
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all uppercase"
              maxlength="20"
            />
            <p class="text-xs text-slate-500 mt-2">Unique identifier for this class</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create Class' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

const router = useRouter();
const { user, token, logout } = useAuth();
const config = useRuntimeConfig();

const classes = ref([]);
const activeSessions = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref('');
const totalStudents = ref(0);
const newClass = ref({
  name: '',
  code: ''
});

// Fetch teacher's classes
onMounted(async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/class/my-classes`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    classes.value = response.data?.classes || [];
  } catch (error) {
    console.error('Failed to fetch classes:', error);
  } finally {
    loading.value = false;
  }

  // Check for active sessions
  fetchActiveSessions();
  fetchTotalStudents();
});

const fetchActiveSessions = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/session/active`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    activeSessions.value = response.data?.sessions || [];
  } catch (error) {
    console.error('Failed to fetch active sessions:', error);
  }
};

const fetchTotalStudents = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/class/stats/total-students`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    totalStudents.value = response.data?.total || 0;
  } catch (error) {
    console.error('Failed to fetch total students:', error);
    totalStudents.value = 0;
  }
};

const startSession = async (classId) => {
  // Check for geolocation support
  if (!navigator.geolocation) {
    if (confirm('Geolocation is not supported. Start session without location?')) {
      startSessionWithoutLocation(classId);
    }
    return;
  }

  // Get location and start session
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const response = await $fetch(`${config.public.apiBase}/api/session/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`
          },
          body: {
            class_id: classId,
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
        });

        // Navigate to the session view
        router.push(`/teacher/session/${response.data.session.id}`);
      } catch (error) {
        console.error('Failed to start session:', error);
        alert(error.data?.message || 'Failed to start session');
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      if (confirm('Failed to get location. Start session without location?')) {
        startSessionWithoutLocation(classId);
      }
    }
  );
};

const startSessionWithoutLocation = async (classId) => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: {
        class_id: classId
      }
    });

    // Navigate to the session view
    router.push(`/teacher/session/${response.data.session.id}`);
  } catch (error) {
    console.error('Failed to start session:', error);
    alert(error.data?.message || 'Failed to start session');
  }
};

const createClass = async () => {
  creating.value = true;
  createError.value = '';

  try {
    const response = await $fetch(`${config.public.apiBase}/api/class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: {
        name: newClass.value.name,
        code: newClass.value.code
      }
    });

    // Add new class to list
    classes.value.unshift(response.data.class);
    
    // Close modal and reset form
    closeCreateModal();
  } catch (error) {
    createError.value = error.data?.message || 'Failed to create class';
  } finally {
    creating.value = false;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  createError.value = '';
  newClass.value = {
    name: '',
    code: ''
  };
};

const handleLogout = () => {
  logout();
  router.push('/login');
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};
</script>
