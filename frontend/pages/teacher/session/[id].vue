<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- Floating Controls - Responsive -->
    <div class="absolute top-4 left-4 right-4 md:top-6 md:right-6 md:left-auto z-20 flex flex-col md:flex-row gap-3">
      <button @click="openManualModal" class="px-4 md:px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all shadow-2xl flex items-center justify-center gap-2 text-sm md:text-base">
        <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Manual Add
      </button>
      <button @click="endSession" class="px-4 md:px-6 py-2.5 md:py-3 bg-rose-500/90 backdrop-blur-xl border border-rose-400/30 text-white rounded-2xl font-semibold hover:bg-rose-600 transition-all shadow-2xl flex items-center justify-center gap-2 text-sm md:text-base">
        <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        End Session
      </button>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 pt-32 md:pt-12">
      <!-- Class Info Header -->
      <div class="text-center mb-8 md:mb-12">
        <div class="inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-4 md:mb-6">
          <div class="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <span class="text-white font-semibold text-sm md:text-base">LIVE SESSION</span>
        </div>
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 px-4">{{ sessionData?.class?.name || 'Loading...' }}</h1>
        <p class="text-xl md:text-2xl text-indigo-200">{{ sessionData?.class?.code }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full">
        <!-- QR Code Hero Section -->
        <div class="flex flex-col items-center">
          <div v-if="currentToken" class="relative">
            <!-- Pulsing Glow Ring -->
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            
            <!-- QR Container -->
            <div class="relative bg-white/10 backdrop-blur-2xl border-2 border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl max-w-lg mx-auto">
              <!-- QR Code Display -->
              <div class="bg-white rounded-2xl p-4 mb-6">
                <canvas ref="qrCanvas" class="w-full h-auto" style="max-width: 400px; max-height: 400px;"></canvas>
              </div>
              
              <!-- Token Display for Manual Entry -->
              <div class="text-center">
                <p class="text-white/90 text-sm font-semibold mb-3">📱 Attendance Token</p>
                <div class="bg-white/95 backdrop-blur-xl border-2 border-white rounded-2xl px-4 py-4 shadow-lg">
                  <p class="text-3xl md:text-4xl font-black text-indigo-600 tracking-widest font-mono break-all select-all">{{ currentToken }}</p>
                </div>
                <p class="text-white/80 text-sm mt-3 leading-relaxed">⌨️ Students can enter this code manually<br>if QR scanning doesn't work</p>
              </div>
              
              <!-- Circular Progress Ring -->
              <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div class="relative w-24 h-24">
                  <svg class="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" stroke-width="8" fill="none" />
                    <circle cx="48" cy="48" r="40" 
                            :stroke-dasharray="251.2" 
                            :stroke-dashoffset="251.2 * (1 - countdown / 30)"
                            stroke="url(#gradient)" 
                            stroke-width="8" 
                            fill="none" 
                            class="transition-all duration-1000 ease-linear" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl font-bold text-white">{{ countdown }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-4">
            <div class="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p class="text-white text-lg">Generating QR Code...</p>
          </div>

          <p class="text-indigo-200 text-center mt-8 max-w-lg leading-relaxed">
            <span class="font-semibold text-white">📱 For QR Scan:</span> Students scan this code within 100m radius
            <br>
            <span class="font-semibold text-white">⌨️ For Manual Entry:</span> Students enter the token shown above
            <br>
            <span class="text-indigo-300 text-sm">🔄 Auto-refresh every 30 seconds for security</span>
          </p>
        </div>

        <!-- Live Feed -->
        <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Present Students</h2>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-4xl font-bold text-white">{{ attendances.length }}</div>
                <div class="text-sm text-indigo-200">checked in</div>
              </div>
            </div>
          </div>

          <!-- Student Bubbles -->
          <div class="flex flex-wrap gap-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div
              v-for="(attendance, index) in attendances"
              :key="attendance.id"
              :style="{ animationDelay: `${index * 50}ms` }"
              class="group relative animate-slide-in-up"
            >
              <div class="relative">
                <!-- Student Bubble -->
                <div class="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                  <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    {{ attendance.student.name.charAt(0) }}
                  </div>
                  <div class="pr-2">
                    <p class="font-semibold text-white text-sm">{{ attendance.student.name }}</p>
                    <p class="text-xs text-indigo-200">{{ attendance.student.student_no }}</p>
                  </div>
                  <span
                    :class="attendance.type === 'QR' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-purple-500/20 text-purple-300 border-purple-400/30'"
                    class="px-2 py-1 rounded-lg text-xs font-semibold border"
                  >
                    {{ attendance.type }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="attendances.length === 0" class="w-full text-center py-16">
              <div class="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <p class="text-white/60 text-lg">Waiting for students to join...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Add Modal -->
    <div v-if="showManualModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-slate-900">Manual Entry</h3>
          <button @click="closeManualModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Student Number</label>
          <input
            v-model="manualStudentId"
            type="text"
            placeholder="Enter student number"
            class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            @keyup.enter="submitManualAttendance"
          />
        </div>

        <div class="flex gap-3">
          <button @click="submitManualAttendance" class="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all">
            Add Student
          </button>
          <button @click="closeManualModal" class="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
            Cancel
          </button>
        </div>

        <p v-if="manualError" class="text-rose-600 text-sm mt-4 bg-rose-50 px-4 py-2 rounded-lg">{{ manualError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes blob {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  @keyframes slide-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }

  .animate-slide-in-up {
    animation: slide-in-up 0.3s ease-out forwards;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  </style>

<script setup>
import QRCode from 'qrcode';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { getAuthHeaders, user, token } = useAuth();
const { connect, emit, on, off, disconnect } = useSocket();

const sessionId = route.params.id;
const sessionData = ref(null);
const currentToken = ref(null);
const attendances = ref([]);
const countdown = ref(30);
const qrCanvas = ref(null);
const showManualModal = ref(false);
const manualStudentId = ref('');
const manualError = ref('');

let countdownInterval = null;

// Fetch session data
const fetchSession = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/session/${sessionId}`, {
      headers: getAuthHeaders()
    });

    if (response.success) {
      sessionData.value = response.data.session;
      attendances.value = response.data.session.attendances || [];
    }
  } catch (error) {
    console.error('Failed to fetch session:', error);
    alert('Failed to load session');
    router.push('/teacher');
  }
};

// Generate QR Code
const generateQR = async (token) => {
  if (!qrCanvas.value) return;
  
  try {
    await QRCode.toCanvas(qrCanvas.value, token, {
      width: 400,
      margin: 2,
      color: {
        dark: '#4f46e5',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
  }
};

// Socket connection
onMounted(async () => {
  await fetchSession();

  const socket = connect();
  
  // Join session room
  emit('join_session', { sessionId, role: 'teacher' });

  // Listen for QR tokens
  on('qr_token', (data) => {
    currentToken.value = data.token;
    generateQR(data.token);
    
    // Reset countdown
    countdown.value = 30;
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) countdown.value = 30;
    }, 1000);
  });

  // Listen for new attendances
  on('new_attendance', (data) => {
    // Check if already in list
    if (!attendances.value.find(a => a.id === data.attendance.id)) {
      attendances.value.unshift(data.attendance);
    }
  });
});

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  emit('leave_session', { sessionId, role: 'teacher' });
  disconnect();
});

// End session
const endSession = async () => {
  if (!confirm('Are you sure you want to end this session?')) return;

  try {
    const response = await $fetch(`${config.public.apiBase}/api/session/end/${sessionId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (response.success) {
      alert('Session ended successfully');
      router.push('/teacher');
    }
  } catch (error) {
    console.error('End session error:', error);
    alert('Failed to end session');
  }
};

// Manual attendance
const openManualModal = () => {
  showManualModal.value = true;
  manualStudentId.value = '';
  manualError.value = '';
};

const closeManualModal = () => {
  showManualModal.value = false;
};

const submitManualAttendance = async () => {
  manualError.value = '';
  
  if (!manualStudentId.value) {
    manualError.value = 'Please enter a student ID';
    return;
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/api/attendance/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: {
        session_id: parseInt(sessionId),
        student_no: manualStudentId.value  // Changed to student_no instead of student_id
      }
    });

    if (response.success) {
      closeManualModal();
      // Attendance will be added via socket
    }
  } catch (error) {
    console.error('Manual attendance error:', error);
    manualError.value = error.data?.message || 'Failed to add attendance';
  }
};

// Format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
