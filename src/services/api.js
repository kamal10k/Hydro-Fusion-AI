const API_BASE = 'http://localhost:5000/api';

// Helper for HTTP requests with token header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hydro_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.details || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth System Endpoints
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, confirmPassword, role = 'Operator', facilityName = 'Facility Alpha') => 
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, confirm_password: confirmPassword, role, facility_name: facilityName }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword, confirmPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  getMe: () => request('/auth/me'),
  verifyLoginOtp: (loginAttemptId, otp) => request('/auth/verify-login-otp', { method: 'POST', body: JSON.stringify({ login_attempt_id: loginAttemptId, otp }) }),
  resendLoginOtp: (loginAttemptId) => request('/auth/resend-login-otp', { method: 'POST', body: JSON.stringify({ login_attempt_id: loginAttemptId }) }),
  verifyEmail: (registrationToken, code, email = '') => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ registration_token: registrationToken, code, email }) }),
  resendVerification: (registrationToken, email = '') => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ registration_token: registrationToken, email }) }),





  // Prediction & What-If
  predict: (params) => request('/predict', { method: 'POST', body: JSON.stringify(params) }),
  simulate: (params) => request('/simulate', { method: 'POST', body: JSON.stringify(params) }),

  // 24-Hour Forecasting
  getForecast24h: () => request('/forecast/24h'),
  simulateForecast: (telemetry) => request('/forecast/simulate', { method: 'POST', body: JSON.stringify(telemetry) }),

  // Multi-Timeframe Analytics
  getDailyAnalytics: () => request('/analytics/daily'),
  getWeeklyAnalytics: () => request('/analytics/weekly'),
  getMonthlyAnalytics: () => request('/analytics/monthly'),

  // History & Dashboard
  getHistory: (risk = '') => request(`/history${risk ? `?risk=${risk}` : ''}`),
  getDashboardStats: () => request('/dashboard/stats'),

  // Chatbot
  sendChatMessage: (question) => request('/chat', { method: 'POST', body: JSON.stringify({ question }) }),
  getChatHistory: () => request('/chat/history'),

  // Alerts & Threshold Management
  getAlerts: () => request('/alerts'),
  dismissAlert: (alertId) => request(`/alerts/${alertId}/dismiss`, { method: 'PUT' }),
  getThresholds: () => request('/alerts/thresholds'),
  updateThresholds: (data) => request('/alerts/thresholds', { method: 'PUT', body: JSON.stringify(data) }),

  // Reports
  getReportData: (predictionId = null) => request(`/report/export${predictionId ? `?prediction_id=${predictionId}` : ''}`)
};

