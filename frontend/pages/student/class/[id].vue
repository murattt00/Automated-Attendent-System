<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-white/80 border-t border-slate-200 px-4 py-3 shadow-lg">
      <div class="flex justify-around items-center">
        <NuxtLink to="/student" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs font-medium">Home</span>
        </NuxtLink>
        <NuxtLink to="/student/scan" class="flex flex-col items-center gap-1 text-slate-400">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-200">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-white opacity-0">Scan</span>
        </NuxtLink>
        <button @click="router.push('/student')" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span class="text-xs font-medium">Back</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <NuxtLink to="/student" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>

        <!-- Class Header Card -->
        <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-slate-100">
          <!-- Gradient Header -->
          <div class="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-8 relative overflow-hidden">
            <div class="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full"></div>
            <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full"></div>
            
            <div class="relative z-10">
              <div class="text-white/80 text-sm font-medium mb-2">Course Code</div>
              <div class="text-5xl font-bold text-white tracking-tight">{{ classData?.code }}</div>
            </div>
          </div>

          <!-- Class Info -->
          <div class="p-8">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ classData?.name }}</h1>
            <p class="text-slate-500 mb-6">{{ classData?.teacher_name }}</p>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                <div class="text-sm text-indigo-600 font-semibold mb-1">Total Sessions</div>
                <div class="text-3xl font-bold text-indigo-900">{{ sessions.length }}</div>
              </div>
              <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5">
                <div class="text-sm text-emerald-600 font-semibold mb-1">Attended</div>
                <div class="text-3xl font-bold text-emerald-900">{{ attendedCount }}</div>
              </div>
              <div class="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5">
                <div class="text-sm text-violet-600 font-semibold mb-1">Attendance Rate</div>
                <div class="text-3xl font-bold" :class="attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600'">
                  {{ attendanceRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Timeline -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-6">
          Attendance History
        </h2>

        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p class="text-slate-600 font-medium">Loading attendance records...</p>
        </div>

        <div v-else-if="sessions.length === 0" class="flex flex-col items-center justify-center py-16">
          <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">No sessions yet</h3>
          <p class="text-slate-500">Your attendance history will appear here after the first session</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(session, index) in sessions" :key="session.id" 
               class="relative flex gap-4 group">
            <!-- Timeline Line -->
            <div class="flex flex-col items-center flex-shrink-0">
              <div class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                   :class="session.attendance ? 'bg-emerald-100 ring-4 ring-emerald-50' : 'bg-rose-100 ring-4 ring-rose-50'">
                <svg v-if="session.attendance" class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div v-if="index < sessions.length - 1" 
                   class="w-0.5 flex-1 bg-slate-200 mt-2"></div>
            </div>
            
            <!-- Session Card -->
            <div class="flex-1 pb-6">
              <div class="bg-slate-50 hover:bg-slate-100 rounded-2xl p-5 transition-all">
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div class="font-bold text-lg text-slate-900">{{ formatDate(session.start_time) }}</div>
                    <div class="text-sm text-slate-500">{{ formatTime(session.start_time) }}</div>
                  </div>
                  <div class="flex gap-2">
                    <span v-if="session.attendance" 
                          :class="session.attendance.type === 'QR' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                      {{ session.attendance.type }}
                    </span>
                    <span :class="session.attendance ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="session.attendance" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {{ session.attendance ? 'Present' : 'Absent' }}
                    </span>
                  </div>
                </div>
                
                <div v-if="session.attendance" class="text-xs text-slate-400">
                  Marked at {{ formatTime(session.attendance.createdAt) }}
                </div>
                <div v-else class="text-xs text-slate-400">
                  You were not present in this session
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const { token } = useAuth();
const config = useRuntimeConfig();

const classId = route.params.id;
const classData = ref(null);
const sessions = ref([]);
const loading = ref(true);

const attendedCount = computed(() => {
  return sessions.value.filter(s => s.attendance).length;
});

const attendanceRate = computed(() => {
  if (sessions.value.length === 0) return 0;
  return Math.round((attendedCount.value / sessions.value.length) * 100);
});

onMounted(async () => {
  await fetchClassHistory();
});

const fetchClassHistory = async () => {
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/api/attendance/my-class-history`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    
    const classHistory = response.data?.classes?.find(c => c.class_id === parseInt(classId));
    
    if (classHistory) {
      classData.value = {
        name: classHistory.class_name,
        code: classHistory.class_code,
        id: classHistory.class_id,
        teacher_name: classHistory.teacher_name || 'Unknown Teacher'
      };
      sessions.value = classHistory.sessions || [];
    }
  } catch (error) {
    console.error('Failed to fetch class history:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
</script>
