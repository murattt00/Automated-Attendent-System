<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <!-- Header -->
    <div class="bg-white shadow-md">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Mark Attendance</h1>
            <p class="text-gray-600 text-sm mt-1">{{ user?.name }} ({{ user?.student_no }})</p>
          </div>
          <button @click="showManualInput = !showManualInput" 
                  class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            {{ showManualInput ? 'Scan QR' : 'Manual Token' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- HTTPS Warning for Camera Access -->
      <div v-if="!isSecureContext && !showManualInput" class="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="font-bold text-amber-800 mb-1">Camera Access Restricted</h3>
            <p class="text-sm text-amber-700 mb-2">
              Your browser blocks camera access over HTTP connections for security. To use QR scanning:
            </p>
            <ul class="text-sm text-amber-700 list-disc list-inside space-y-1 mb-2">
              <li>Use the "Manual Token" option above, OR</li>
              <li>Ask your teacher to enable HTTPS access</li>
            </ul>
            <p class="text-xs text-amber-600 italic">
              Note: If you see "Allow camera" prompt, your device may still support it - try allowing access.
            </p>
          </div>
        </div>
      </div>

      <!-- Manual Token Input -->
      <div v-if="showManualInput && !result" class="card">
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">Enter Attendance Token</h2>
        
        <div class="max-w-md mx-auto">
          <div class="mb-4">
            <label for="token" class="block text-sm font-semibold text-gray-700 mb-2">
              Attendance Token
            </label>
            <input
              id="token"
              v-model="manualToken"
              type="text"
              placeholder="Enter the token from teacher's screen"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-center text-lg font-mono tracking-wider uppercase"
              @keyup.enter="submitManualToken"
              :disabled="processing"
            />
            <p class="text-xs text-gray-500 mt-2 text-center">
              The token is displayed on your teacher's QR code screen
            </p>
          </div>
          
          <button
            @click="submitManualToken"
            :disabled="processing || !manualToken.trim()"
            class="w-full btn-primary flex items-center justify-center gap-2"
          >
            <svg v-if="processing" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ processing ? 'Submitting...' : 'Submit Attendance' }}</span>
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            📍 Make sure you are within 100 meters of the classroom
          </p>
          <p class="text-gray-500 text-xs mt-2">
            Location permission will be requested when you submit
          </p>
        </div>
      </div>

      <!-- Scanner Section -->
      <div v-else-if="!result" class="card">
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">Scan QR Code</h2>

        <!-- Camera View -->
        <div class="relative bg-black rounded-xl overflow-hidden" style="aspect-ratio: 1/1; max-width: 500px; margin: 0 auto;">
          <qrcode-stream
            @detect="onDetect"
            @error="onError"
            @camera-on="onCameraReady"
            :track="paintBoundingBox"
          >
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p class="text-white">Initializing camera...</p>
              </div>
            </div>
          </qrcode-stream>
        </div>

        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            📍 Make sure you are within 100 meters of the classroom
          </p>
          <p class="text-gray-500 text-xs mt-2">
            Allow camera and location permissions when prompted
          </p>
        </div>
      </div>

      <!-- Success/Error Result -->
      <div v-else class="card text-center">
        <!-- Success -->
        <div v-if="result.success" class="py-8">
          <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-green-600 mb-3">Attendance Marked!</h2>
          <p class="text-gray-700 text-lg mb-2">{{ result.message }}</p>
          <p v-if="result.distance" class="text-gray-500 text-sm">
            Distance from classroom: {{ result.distance }}m
          </p>
          
          <button @click="reset" class="btn-primary mt-8">
            Scan Another
          </button>
        </div>

        <!-- Error -->
        <div v-else class="py-8">
          <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-red-600 mb-3">Failed</h2>
          <p class="text-gray-700 text-lg mb-2">{{ result.message }}</p>
          
          <button @click="reset" class="btn-primary mt-8">
            Try Again
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="font-bold text-blue-900 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          How to mark attendance
        </h3>
        <ol class="text-sm text-blue-800 space-y-2">
          <li>1. Make sure you're in or near the classroom</li>
          <li>2. Allow camera and location permissions</li>
          <li>3. Point your camera at the teacher's QR code</li>
          <li>4. Wait for automatic detection and verification</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader';

const config = useRuntimeConfig();
const { getAuthHeaders, user } = useAuth();

const loading = ref(true);
const result = ref(null);
const processing = ref(false);
const showManualInput = ref(false);
const manualToken = ref('');
const isSecureContext = ref(true);

// Check if we're in a secure context (HTTPS or localhost)
onMounted(() => {
  isSecureContext.value = window.isSecureContext;
  // If not secure, default to manual input
  if (!window.isSecureContext) {
    showManualInput.value = true;
  }
});

// Camera ready
const onCameraReady = () => {
  loading.value = false;
};

// Error handler
const onError = (error) => {
  console.error('Camera error:', error);
  
  let message = 'Camera access failed';
  if (error.name === 'NotAllowedError') {
    message = 'Camera permission denied. Please allow camera access or use Manual Token option.';
  } else if (error.name === 'NotFoundError') {
    message = 'No camera found on this device. Please use Manual Token option.';
  } else if (error.name === 'NotSupportedError') {
    message = 'Camera not supported in this browser. Please use Manual Token option.';
  } else if (error.name === 'NotReadableError') {
    message = 'Camera is being used by another app. Please close it or use Manual Token option.';
  } else if (error.name === 'SecurityError') {
    message = 'Camera access blocked for security reasons. Please use Manual Token option or enable HTTPS.';
  }
  
  result.value = { success: false, message };
  loading.value = false;
};

// Paint bounding box on detected QR
const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const { boundingBox: { x, y, width, height } } = detectedCode;
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(x, y, width, height);
  }
};

// QR Code detected
const onDetect = async (detectedCodes) => {
  if (processing.value || !detectedCodes || detectedCodes.length === 0) return;
  
  processing.value = true;
  const qrData = detectedCodes[0].rawValue;
  
  await submitAttendance(qrData);
};

// Submit attendance with token (from QR or manual input)
const submitAttendance = async (token) => {
  try {
    // Get geolocation
    const position = await getCurrentPosition();
    
    // Submit attendance
    const response = await $fetch(`${config.public.apiBase}/api/attendance/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        token: token,
        lat: position.coords.latitude,
        long: position.coords.longitude
      }
    });

    if (response.success) {
      result.value = {
        success: true,
        message: response.message,
        distance: response.data.distance
      };
    } else {
      result.value = {
        success: false,
        message: response.message
      };
    }
  } catch (error) {
    console.error('Attendance submission error:', error);
    
    let errorMessage = 'Failed to submit attendance';
    if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message === 'Location permission denied') {
      errorMessage = 'Location permission denied. Please enable location access.';
    }
    
    result.value = {
      success: false,
      message: errorMessage
    };
  } finally {
    processing.value = false;
  }
};

// Submit manual token
const submitManualToken = async () => {
  if (!manualToken.value.trim()) {
    return;
  }
  
  processing.value = true;
  await submitAttendance(manualToken.value.trim().toUpperCase());
};

// Get current position
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        console.error('Geolocation error:', error);
        reject(new Error('Location permission denied'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Reset scanner
const reset = () => {
  result.value = null;
  processing.value = false;
  manualToken.value = '';
  loading.value = true;
};
</script>

<style scoped>
/* QR Scanner styles are handled by vue-qrcode-reader */
</style>
