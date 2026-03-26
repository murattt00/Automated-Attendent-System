export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // If not authenticated, redirect to login
    if (!token || !user) {
      return navigateTo('/login');
    }

    // Parse user data
    const userData = JSON.parse(user);

    // Check role-based access
    if (to.path.startsWith('/teacher') && userData.role !== 'teacher') {
      return navigateTo('/student');
    }

    if (to.path.startsWith('/student') && userData.role !== 'student') {
      return navigateTo('/teacher');
    }
  }
});
