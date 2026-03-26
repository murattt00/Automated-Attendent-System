export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    }
  },

  app: {
    head: {
      title: 'University Attendance System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'QR-based attendance system with real-time updates' }
      ]
    }
  },

  ssr: false
})
