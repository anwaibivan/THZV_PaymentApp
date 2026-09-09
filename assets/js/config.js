// API Configuration
// Update this URL to match where your colleague is running the ASP.NET application
var API_CONFIG = {
  // Default: localhost with IIS Express port (usually 44300-44400 range)
  // Your colleague should provide the actual URL when running the application
  BASE_URL: 'http://localhost:44365', // Update this port number
  
  // Endpoints
  ENDPOINTS: {
    LOGIN: '/Home/Login',
    REGISTER: '/Merchants/Register',
    DASHBOARD: '/Payments/Dashboard'
  }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return API_CONFIG.BASE_URL + endpoint;
}
