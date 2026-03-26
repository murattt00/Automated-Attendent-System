export const useAuth = () => {
  const config = useRuntimeConfig();
  const user = useState('user', () => null);
  const token = useState('token', () => null);

  // Initialize from localStorage (client-side only)
  if (process.client) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/api/auth/login`, {
        method: 'POST',
        body: { email, password }
      });

      if (response.success) {
        token.value = response.data.token;
        user.value = response.data.user;
        
        if (process.client) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      // Validation hatalarını yakala
      if (error.data?.errors) {
        const errorMessages = error.data.errors.map(err => err.message).join('\n');
        return { success: false, message: errorMessages, errors: error.data.errors };
      }
      return { success: false, message: error.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/api/auth/register`, {
        method: 'POST',
        body: userData
      });

      if (response.success) {
        token.value = response.data.token;
        user.value = response.data.user;
        
        if (process.client) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return { success: true };
      }
      return { success: false, message: response.message, errors: response.errors };
    } catch (error) {
      console.error('Register error:', error);
      // Validation hatalarını yakala
      if (error.data?.errors) {
        const errorMessages = error.data.errors.map(err => err.message).join('\n');
        return { success: false, message: errorMessages, errors: error.data.errors };
      }
      return { success: false, message: error.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    navigateTo('/login');
  };

  const getAuthHeaders = () => {
    return {
      Authorization: `Bearer ${token.value}`
    };
  };

  const isAuthenticated = computed(() => !!token.value);
  const isTeacher = computed(() => user.value?.role === 'teacher');
  const isStudent = computed(() => user.value?.role === 'student');

  return {
    user,
    token,
    login,
    register,
    logout,
    getAuthHeaders,
    isAuthenticated,
    isTeacher,
    isStudent
  };
};
