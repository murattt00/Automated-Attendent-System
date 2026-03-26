<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-white/80 border-t border-slate-200 px-4 py-3 shadow-lg">
      <div class="flex justify-around items-center">
        <NuxtLink to="/teacher" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs font-medium">Home</span>
        </NuxtLink>
        <button @click="startNewSession" :disabled="startingSession" class="flex flex-col items-center gap-1 text-slate-400">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-200 disabled:opacity-50">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-white opacity-0">Start</span>
        </button>
        <button @click="router.push('/teacher')" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-xs font-medium">Back</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <!-- Header with Gradient Card -->
      <div class="mb-8">
        <NuxtLink to="/teacher" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>

        <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-slate-100">
          <!-- Gradient Header -->
          <div class="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-8 relative overflow-hidden">
            <!-- Decorative circles -->
            <div class="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full"></div>
            <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full"></div>
            
            <div class="relative z-10">
              <div class="text-white/80 text-sm font-medium mb-2">Course Code</div>
              <div class="text-5xl font-bold text-white tracking-tight mb-2">{{ classData?.code }}</div>
            </div>
          </div>

          <!-- Class Info -->
          <div class="p-8">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ classData?.name }}</h1>
                <p class="text-slate-500">Track and manage attendance for this course</p>
              </div>
              <button
                @click="startNewSession"
                :disabled="startingSession"
                class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span v-if="!startingSession">Start New Session</span>
                <span v-else>Starting...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Session Alert -->
      <div v-if="activeSession" class="mb-8">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-2xl shadow-emerald-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold text-white">Session Active</p>
                <p class="text-emerald-100 text-sm">Started {{ formatDateTime(activeSession.start_time) }}</p>
              </div>
            </div>
            <NuxtLink
              :to="`/teacher/session/${activeSession.id}`"
              class="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              View Live Session →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats Summary Cards -->
      <div v-if="students.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ students.length }}</div>
          <div class="text-sm text-slate-500">Total Students</div>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ sessions.length }}</div>
          <div class="text-sm text-slate-500">Total Sessions</div>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-violet-100/50 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-slate-900 mb-1">{{ averageAttendance }}%</div>
          <div class="text-sm text-slate-500">Average Attendance</div>
        </div>
      </div>

      <!-- Attendance History Table -->
      <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-slate-100">
        <div class="p-8 border-b border-slate-100">
          <div class="flex justify-between items-start gap-4">
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Attendance History
              </h2>
              <p class="text-slate-500 mt-1">Complete attendance record for all sessions</p>
            </div>
            <div v-if="sessions.length > 0 && students.length > 0" class="flex gap-3">
              <button
                @click="downloadExcel"
                :disabled="downloadingExcel"
                class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="!downloadingExcel" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="!downloadingExcel">Excel</span>
                <span v-else>...</span>
              </button>
              <button
                @click="downloadPDF"
                :disabled="downloadingPDF"
                class="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="!downloadingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="!downloadingPDF">PDF</span>
                <span v-else>...</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p class="text-slate-600 font-medium">Loading attendance records...</p>
        </div>

        <div v-else-if="students.length === 0" class="flex flex-col items-center justify-center py-16 px-6">
          <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-xl font-semibold text-slate-900 mb-2">No attendance records yet</p>
          <p class="text-slate-500 text-center">Start a session to begin tracking student attendance</p>
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gradient-to-r from-slate-50 to-indigo-50/30">
                <th class="border-b-2 border-indigo-100 px-6 py-4 text-left font-bold text-slate-700 sticky left-0 bg-gradient-to-r from-slate-50 to-indigo-50/30 z-10">
                  Student
                </th>
                <th class="border-b-2 border-indigo-100 px-6 py-4 text-left font-bold text-slate-700">
                  Student No
                </th>
                <th
                  v-for="session in sessions"
                  :key="session.id"
                  class="border-b-2 border-indigo-100 px-6 py-4 text-center font-semibold text-slate-700 min-w-[140px]"
                >
                  <div class="text-sm font-bold">{{ formatDate(session.start_time) }}</div>
                  <div class="text-xs text-slate-500 font-normal mt-1">{{ formatTime(session.start_time) }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(student, index) in students"
                :key="student.id"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
                class="hover:bg-indigo-50/30 transition-colors"
              >
                <td class="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900 sticky left-0 z-10"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'">
                  {{ student.name }}
                </td>
                <td class="border-b border-slate-100 px-6 py-4 text-slate-600 font-medium">
                  {{ student.student_no }}
                </td>
                <td
                  v-for="session in sessions"
                  :key="`${student.id}-${session.id}`"
                  class="border-b border-slate-100 px-6 py-4 text-center"
                >
                  <span
                    v-if="getAttendance(student.id, session.id)"
                    :class="getAttendance(student.id, session.id).type === 'QR' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ getAttendance(student.id, session.id).type === 'QR' ? 'Present' : 'Manual' }}
                  </span>
                  <span v-else class="text-slate-300 text-sm font-medium">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to right, #4f46e5, #7c3aed);
}
</style>

<script setup>
definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const router = useRouter();
const { token } = useAuth();
const config = useRuntimeConfig();

const classId = route.params.id;
const classData = ref(null);
const sessions = ref([]);
const students = ref([]);
const attendanceMap = ref({});
const loading = ref(true);
const startingSession = ref(false);
const activeSession = ref(null);
const downloadingExcel = ref(false);
const downloadingPDF = ref(false);

onMounted(async () => {
  await fetchClassData();
  await fetchAttendanceHistory();
  await checkActiveSession();
});

const fetchClassData = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/class/${classId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    classData.value = response.data.class;
  } catch (error) {
    console.error('Failed to fetch class:', error);
    router.push('/teacher');
  }
};

const fetchAttendanceHistory = async () => {
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/api/class/${classId}/attendance-history`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    
    sessions.value = response.data.sessions || [];
    students.value = response.data.students || [];
    
    // Create attendance map for quick lookup
    const map = {};
    response.data.attendances?.forEach(att => {
      const key = `${att.student_id}-${att.session_id}`;
      map[key] = att;
    });
    attendanceMap.value = map;
  } catch (error) {
    console.error('Failed to fetch attendance history:', error);
  } finally {
    loading.value = false;
  }
};

const checkActiveSession = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/session/active`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    const active = response.data.sessions?.find(s => s.class_id === parseInt(classId));
    activeSession.value = active || null;
  } catch (error) {
    console.error('Failed to check active session:', error);
  }
};

const getAttendance = (studentId, sessionId) => {
  const key = `${studentId}-${sessionId}`;
  return attendanceMap.value[key] || null;
};

const startNewSession = async () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  startingSession.value = true;

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
            class_id: parseInt(classId),
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
        });

        router.push(`/teacher/session/${response.data.session.id}`);
      } catch (error) {
        alert('Failed to start session: ' + (error.data?.message || error.message));
      } finally {
        startingSession.value = false;
      }
    },
    (error) => {
      alert('Failed to get location. Please enable location services.');
      startingSession.value = false;
    }
  );
};

const averageAttendance = computed(() => {
  if (students.value.length === 0 || sessions.value.length === 0) return 0;
  
  const totalSlots = students.value.length * sessions.value.length;
  const presentCount = Object.keys(attendanceMap.value).length;
  
  return Math.round((presentCount / totalSlots) * 100);
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const downloadExcel = async () => {
  try {
    downloadingExcel.value = true;
    
    const response = await fetch(`${config.public.apiBase}/api/class/${classId}/export-excel`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download Excel file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const today = new Date().toISOString().split('T')[0];
    link.download = `Attendance_${classData.value.code}_${today}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Excel download error:', error);
    alert('Excel file download failed: ' + (error.message || 'Unknown error'));
  } finally {
    downloadingExcel.value = false;
  }
};

const downloadPDF = async () => {
  try {
    downloadingPDF.value = true;
    
    const response = await fetch(`${config.public.apiBase}/api/class/${classId}/export-pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const today = new Date().toISOString().split('T')[0];
    link.download = `Attendance_${classData.value.code}_${today}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF download error:', error);
    alert('PDF file download failed: ' + (error.message || 'Unknown error'));
  } finally {
    downloadingPDF.value = false;
  }
};
</script>
