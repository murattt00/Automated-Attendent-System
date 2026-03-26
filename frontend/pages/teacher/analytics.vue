<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/teacher" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>

        <h1 class="text-4xl font-black text-slate-900 mb-2">📊 Analytics Dashboard</h1>
        <p class="text-slate-600">Comprehensive insights into your class attendance</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-600 font-medium">Loading analytics...</p>
      </div>

      <!-- Analytics Content -->
      <div v-else-if="analytics">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Classes -->
          <div class="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 border border-slate-100">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-slate-900 mb-1">{{ analytics.totalClasses }}</div>
            <div class="text-sm text-slate-500">Total Classes</div>
          </div>

          <!-- Total Sessions -->
          <div class="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-100/50 border border-slate-100">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-slate-900 mb-1">{{ analytics.totalSessions }}</div>
            <div class="text-sm text-slate-500">Total Sessions</div>
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
            <div class="text-3xl font-bold text-slate-900 mb-1">{{ analytics.totalStudents }}</div>
            <div class="text-sm text-slate-500">Total Students</div>
          </div>

          <!-- Attendance Rate -->
          <div class="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 shadow-xl shadow-indigo-200">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-white mb-1">{{ analytics.overallAttendanceRate }}%</div>
            <div class="text-sm text-indigo-100">Overall Attendance Rate</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Attendance Trend Line Chart -->
          <div class="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-slate-100">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Attendance Trend (Last 14 Days)</h3>
            <div class="h-64">
              <LineChart 
                v-if="trendData.labels.length > 0"
                :labels="trendData.labels"
                :data="trendData.data"
                label="Attendance Rate"
              />
              <div v-else class="h-full flex items-center justify-center text-slate-400">
                No data available
              </div>
            </div>
          </div>

          <!-- Present vs Absent Doughnut Chart -->
          <div class="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-slate-100">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Overall Distribution</h3>
            <div class="h-64">
              <DoughnutChart 
                :present="analytics.presentCount"
                :absent="analytics.absentCount"
              />
            </div>
          </div>
        </div>

        <!-- Class Statistics -->
        <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-2xl font-bold text-slate-900">Class Statistics</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-bold text-slate-700">Class</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-slate-700">Sessions</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-slate-700">Students</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-slate-700">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cls, index) in analytics.classStats" :key="cls.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-900">{{ cls.name }}</div>
                    <div class="text-sm text-slate-500">{{ cls.code }}</div>
                  </td>
                  <td class="px-6 py-4 text-center text-slate-700">{{ cls.session_count }}</td>
                  <td class="px-6 py-4 text-center text-slate-700">{{ cls.student_count }}</td>
                  <td class="px-6 py-4 text-center">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full" :class="getRateColor(cls.attendance_rate)">
                      <span class="font-bold">{{ cls.attendance_rate }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Sessions -->
        <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-2xl font-bold text-slate-900">Recent Sessions</h3>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="session in analytics.recentSessions" :key="session.id" class="p-6 hover:bg-slate-50/50 transition-colors">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold text-slate-900">{{ session.class_name }}</div>
                  <div class="text-sm text-slate-500">{{ session.class_code }}</div>
                  <div class="text-sm text-slate-600 mt-1">
                    {{ formatDateTime(session.start_time) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full" :class="getRateColor(session.attendance_rate)">
                    <span class="font-bold">{{ session.attendance_rate }}%</span>
                  </div>
                  <div class="text-sm text-slate-500 mt-1">
                    {{ session.attendance_count }} / {{ session.total_students }} students
                  </div>
                </div>
              </div>
            </div>
            <div v-if="analytics.recentSessions.length === 0" class="p-6 text-center text-slate-400">
              No sessions found
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import LineChart from '~/components/LineChart.vue';
import DoughnutChart from '~/components/DoughnutChart.vue';

definePageMeta({
  middleware: ['auth', 'teacher-only']
});

const { token } = useAuth();
const config = useRuntimeConfig();

const loading = ref(true);
const error = ref('');
const analytics = ref(null);

const trendData = computed(() => {
  if (!analytics.value || !analytics.value.attendanceTrend) {
    return { labels: [], data: [] };
  }

  const labels = analytics.value.attendanceTrend.map(t => {
    const date = new Date(t.date);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  });

  const data = analytics.value.attendanceTrend.map(t => {
    if (t.total_slots === 0) return 0;
    return ((t.present / t.total_slots) * 100).toFixed(1);
  });

  return { labels, data };
});

const fetchAnalytics = async () => {
  try {
    loading.value = true;
    const response = await $fetch(`${config.public.apiBase}/api/class/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });

    analytics.value = response.data;
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
    error.value = 'Failed to load analytics data';
  } finally {
    loading.value = false;
  }
};

const getRateColor = (rate) => {
  const r = parseFloat(rate);
  if (r >= 80) return 'bg-emerald-100 text-emerald-700';
  if (r >= 60) return 'bg-blue-100 text-blue-700';
  if (r >= 40) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
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

onMounted(() => {
  fetchAnalytics();
});
</script>
