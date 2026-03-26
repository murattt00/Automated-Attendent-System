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
        <NuxtLink to="/student/scan" class="flex flex-col items-center gap-1 text-slate-400">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-200">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-white opacity-0">Scan</span>
        </NuxtLink>
        <button @click="handleLogout" class="flex flex-col items-center gap-1 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Welcome back! 👋
            </h1>
            <p class="text-lg text-slate-600">{{ user?.name }}</p>
            <p class="text-sm text-slate-400 font-mono">ID: {{ user?.student_no }}</p>
          </div>
          <button @click="handleLogout" class="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <!-- Available Classes -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Discover Classes</h2>
        
        <div v-if="loadingAvailable" class="flex justify-center py-12">
          <div class="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="availableClasses.length === 0" class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-200">
          <p class="text-slate-600">All available classes are enrolled</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="classItem in availableClasses" :key="classItem.id" 
               class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 truncate">{{ classItem.name }}</h3>
              <p class="text-sm text-slate-500 font-mono">{{ classItem.code }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ classItem.teacher?.name }}</p>
            </div>
            <button @click="enrollInClass(classItem.id)" 
                    class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 whitespace-nowrap">
              Join Class
            </button>
          </div>
        </div>
      </div>

      <!-- My Enrolled Classes - Premium Ticket Style -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">My Classes</h2>
          <span class="text-sm text-slate-500">{{ enrolledClasses.length }} enrolled</span>
        </div>
        
        <div v-if="loadingEnrolled" class="flex justify-center py-12">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>
        
        <div v-else-if="enrolledClasses.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-xl shadow-indigo-100/50">
          <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">No classes yet</h3>
          <p class="text-slate-500 mb-6">Enroll in classes below to get started with attendance tracking</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink v-for="classItem in enrolledClasses" :key="classItem.id" 
               :to="`/student/class/${classItem.id}`"
               class="group relative bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer">
            <!-- Gradient Accent -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            
            <!-- Kebab Menu -->
            <div class="absolute top-5 right-5">
              <div class="relative">
                
                <div v-if="openMenuId === classItem.id" 
                     class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-10">
                  <button @click.stop="unenrollFromClass(classItem.id)" 
                          class="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Unenroll from class
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Class Icon -->
            <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <!-- Class Info -->
            <h3 class="text-xl font-bold text-slate-900 mb-1 pr-8">{{ classItem.name }}</h3>
            <p class="text-sm text-slate-500 mb-1 font-mono">{{ classItem.code }}</p>
            <p class="text-sm text-slate-400 mb-4">{{ classItem.teacher_name }}</p>
            
            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600 font-medium">Attendance Rate</span>
                <span class="font-bold" :class="getClassAttendanceRate(classItem.id) >= 75 ? 'text-emerald-600' : 'text-rose-600'">
                  {{ getClassAttendanceRate(classItem.id) }}%
                </span>
              </div>
              <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" 
                     :class="getClassAttendanceRate(classItem.id) >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'"
                     :style="{ width: getClassAttendanceRate(classItem.id) + '%' }"></div>
              </div>
              <p class="text-xs text-slate-400">
                {{ getClassAttendedSessions(classItem.id) }} / {{ getClassTotalSessions(classItem.id) }} sessions attended
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- QR Scanner CTA -->
      <div class="mb-8">
        <div class="relative bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 md:p-10 shadow-2xl shadow-indigo-200 overflow-hidden">
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div class="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div class="flex-1 text-center md:text-left">
              <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">Ready to Mark Attendance?</h3>
              <p class="text-indigo-100 text-sm md:text-base">Scan the QR code displayed by your teacher to check in</p>
            </div>
            <NuxtLink to="/student/scan" 
                      class="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap">
              Open Scanner →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Attendance History - Removed, now in individual class pages -->
      <div v-if="false">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Attendance Timeline</h2>
        
        <div v-if="loadingHistory" class="flex justify-center py-12">
          <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="classHistories.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-xl shadow-slate-100">
          <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">No attendance records</h3>
          <p class="text-slate-500">Your attendance history will appear here after you scan your first QR code</p>
        </div>
        
        <div v-else class="space-y-6">
          <!-- Timeline for each class -->
          <div v-for="classHistory in classHistories" :key="classHistory.class_id" 
               class="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100 border border-slate-100">
            <!-- Class Header -->
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-900">{{ classHistory.class_name }}</h3>
                <p class="text-sm text-slate-500 font-mono">{{ classHistory.class_code }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold" :class="getAttendancePercentage(classHistory.sessions) >= 75 ? 'text-emerald-600' : 'text-rose-600'">
                  {{ getAttendancePercentage(classHistory.sessions) }}%
                </div>
                <div class="text-xs text-slate-500">
                  {{ getAttendedCount(classHistory.sessions) }}/{{ classHistory.sessions.length }} attended
                </div>
              </div>
            </div>
            
            <!-- Timeline Items -->
            <div class="space-y-4">
              <div v-for="(session, index) in classHistory.sessions.slice(0, 5)" :key="session.id" 
                   class="relative flex gap-4 group">
                <!-- Timeline Line -->
                <div class="flex flex-col items-center flex-shrink-0">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                       :class="session.attendance ? 'bg-emerald-100 ring-4 ring-emerald-50' : 'bg-rose-100 ring-4 ring-rose-50'">
                    <svg v-if="session.attendance" class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div v-if="index < classHistory.sessions.slice(0, 5).length - 1" 
                       class="w-0.5 h-full bg-slate-200 mt-1"></div>
                </div>
                
                <!-- Session Info -->
                <div class="flex-1 pb-6">
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div class="font-semibold text-slate-900">{{ formatDate(session.start_time) }}</div>
                      <div class="text-sm text-slate-500">{{ formatTime(session.start_time) }}</div>
                    </div>
                    <div class="flex gap-2">
                      <span v-if="session.attendance" 
                            :class="session.attendance.type === 'QR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
                            class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ session.attendance.type }}
                      </span>
                      <span :class="session.attendance ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                            class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ session.attendance ? 'Present' : 'Absent' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Show More Button -->
              <div v-if="classHistory.sessions.length > 5" class="text-center pt-2">
                <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all {{ classHistory.sessions.length }} sessions →
                </button>
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

const { user, logout, getAuthHeaders } = useAuth();
const config = useRuntimeConfig();

const availableClasses = ref([]);
const enrolledClasses = ref([]);
const attendanceHistory = ref([]);
const classHistories = ref([]);
const loadingAvailable = ref(true);
const loadingEnrolled = ref(true);
const loadingHistory = ref(true);
const openMenuId = ref(null);

// Toggle dropdown menu
function toggleMenu(classId) {
  openMenuId.value = openMenuId.value === classId ? null : classId;
}

// Close menu when clicking outside
if (process.client) {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      openMenuId.value = null;
    }
  });
}

// Handle logout
function handleLogout() {
  logout();
}

// Fetch available classes
async function fetchAvailableClasses() {
  try {
    loadingAvailable.value = true;
    const response = await fetch(`${config.public.apiBase}/api/enrollment/available`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      availableClasses.value = data.data.classes;
    }
  } catch (error) {
    console.error('Error fetching available classes:', error);
  } finally {
    loadingAvailable.value = false;
  }
}

// Fetch enrolled classes
async function fetchEnrolledClasses() {
  try {
    loadingEnrolled.value = true;
    const response = await fetch(`${config.public.apiBase}/api/enrollment/enrolled`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      enrolledClasses.value = data.data.classes;
    }
  } catch (error) {
    console.error('Error fetching enrolled classes:', error);
  } finally {
    loadingEnrolled.value = false;
  }
}

// Fetch attendance history by class
async function fetchAttendanceHistory() {
  try {
    loadingHistory.value = true;
    const response = await fetch(`${config.public.apiBase}/api/attendance/my-class-history`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      classHistories.value = data.data.classes;
    }
  } catch (error) {
    console.error('Error fetching attendance history:', error);
  } finally {
    loadingHistory.value = false;
  }
}

// Calculate attendance statistics
function getAttendedCount(sessions) {
  return sessions.filter(s => s.attendance !== null).length;
}

function getAttendancePercentage(sessions) {
  if (sessions.length === 0) return 0;
  const attended = getAttendedCount(sessions);
  return Math.round((attended / sessions.length) * 100);
}

// Get all unique sessions from all classes (sorted by date)
function getAllUniqueSessions() {
  const allSessions = [];
  const sessionIds = new Set();
  
  classHistories.value.forEach(classHistory => {
    classHistory.sessions.forEach(session => {
      if (!sessionIds.has(session.id)) {
        sessionIds.add(session.id);
        allSessions.push(session);
      }
    });
  });
  
  // Sort by start_time (newest first)
  return allSessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
}

// Get attendance for a specific class and session
function getAttendanceForSession(classHistory, sessionId) {
  const session = classHistory.sessions.find(s => s.id === sessionId);
  return session?.attendance || null;
}

// Check if session belongs to this class
function isSessionForClass(classHistory, sessionId) {
  return classHistory.sessions.some(s => s.id === sessionId);
}

// Enroll in class
async function enrollInClass(classId) {
  try {
    const response = await fetch(`${config.public.apiBase}/api/enrollment/enroll`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ class_id: classId })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('✅ Successfully enrolled in class!');
      await fetchAvailableClasses();
      await fetchEnrolledClasses();
    } else {
      alert('❌ ' + (data.message || 'Failed to enroll'));
    }
  } catch (error) {
    console.error('Error enrolling:', error);
    alert('❌ Failed to enroll in class');
  }
}

// Unenroll from class
async function unenrollFromClass(classId) {
  openMenuId.value = null;
  
  if (!confirm('Are you sure you want to unenroll from this class?')) {
    return;
  }
  
  try {
    const response = await fetch(`${config.public.apiBase}/api/enrollment/unenroll`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ class_id: classId })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('✅ Successfully unenrolled from class');
      await fetchAvailableClasses();
      await fetchEnrolledClasses();
      await fetchAttendanceHistory();
    } else {
      alert('❌ ' + (data.message || 'Failed to unenroll'));
    }
  } catch (error) {
    console.error('Error unenrolling:', error);
    alert('❌ Failed to unenroll from class');
  }
}

// Get class-specific attendance stats
function getClassAttendanceRate(classId) {
  const classHistory = classHistories.value.find(c => c.class_id === classId);
  if (!classHistory || classHistory.sessions.length === 0) return 0;
  return getAttendancePercentage(classHistory.sessions);
}

function getClassAttendedSessions(classId) {
  const classHistory = classHistories.value.find(c => c.class_id === classId);
  if (!classHistory) return 0;
  return getAttendedCount(classHistory.sessions);
}

function getClassTotalSessions(classId) {
  const classHistory = classHistories.value.find(c => c.class_id === classId);
  if (!classHistory) return 0;
  return classHistory.sessions.length;
}

// Date/time formatters
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load data on mount
onMounted(() => {
  fetchAvailableClasses();
  fetchEnrolledClasses();
  fetchAttendanceHistory();
});
</script>
