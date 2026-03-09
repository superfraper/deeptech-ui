import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? window.location.origin
    : 'http://localhost:8000');

console.log('API_BASE_URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.token = null;
    this.auth0 = null;
  }

  setAuth0(auth0) {
    this.auth0 = auth0;
  }

  async getToken() {
    if (!this.auth0) {
      throw new Error('You forgot to wrap your component in <Auth0Provider>.');
    }

    // Add debugging to understand the Auth0 state
    console.log('Auth0 context:', {
      isAuthenticated: this.auth0.isAuthenticated,
      isLoading: this.auth0.isLoading,
      user: this.auth0.user,
    });

    try {
      // Check if Auth0 is still loading
      if (this.auth0.isLoading) {
        throw new Error('Auth0 is still loading');
      }

      // Check if user is authenticated first (isAuthenticated is a property, not a promise)
      if (!this.auth0.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const token = await this.auth0.getAccessTokenSilently({
        audience:
          process.env.REACT_APP_AUTH0_AUDIENCE || 'https://esf-dash-rag-api',
        scope: 'read:current_user',
      });

      console.log('Token retrieved successfully');
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async makeRequest(url, options = {}, retryCount = 0) {
    const maxRetries = 1; // Limit retries to prevent infinite loops

    try {
      const token = await this.getToken();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      // Add logging to debug token type issues
      if (url.includes('token_type=')) {
        console.log(
          `Making request with token_type=${url.split('token_type=')[1]} for URL: ${url}`
        );
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Special handling for 404 or 500 errors on token_type requests
        if (
          (response.status === 404 || response.status === 500) &&
          url.includes('token_type=') &&
          url.includes('/api/sections/')
        ) {
          const tokenType = new URLSearchParams(url.split('?')[1]).get(
            'token_type'
          );
          console.warn(
            `Error ${response.status} with token type: ${tokenType}. This might indicate missing database or tables.`
          );

          // If ART or EMT token type fails, try falling back to OTH as a last resort
          if (tokenType !== 'OTH' && retryCount < maxRetries) {
            const fallbackUrl = url.replace(
              `token_type=${tokenType}`,
              'token_type=OTH'
            );
            console.log(
              `Attempting fallback to OTH token type: ${fallbackUrl}`
            );
            return this.makeRequest(fallbackUrl, options, retryCount + 1);
          }
        }

        if (response.status === 401 && retryCount < maxRetries) {
          // Token might be expired, try to refresh once
          try {
            await this.auth0.getAccessTokenSilently({
              audience:
                process.env.REACT_APP_AUTH0_AUDIENCE ||
                'https://esf-dash-rag-api',
              scope: 'read:current_user',
              ignoreCache: true,
            });
            // Retry the request with incremented counter
            return this.makeRequest(url, options, retryCount + 1);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error(`Authentication failed: ${refreshError.message}`);
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (authError) {
      // If authentication fails, try to make an unauthenticated request for certain endpoints
      console.warn(
        'Authentication failed, attempting unauthenticated request:',
        authError.message
      );

      // Only allow fallback for specific endpoints that have public versions
      if (url === '/dummy' && retryCount === 0) {
        return this.makeUnauthenticatedRequest('/public/dummy', options);
      }

      // For other endpoints, re-throw the authentication error
      throw authError;
    }
  }

  async makeUnauthenticatedRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API methods
  async uploadFile(file, abortController = null) {
    const token = await this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    // Add abort signal if provided
    if (abortController) {
      fetchOptions.signal = abortController.signal;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async abortFileUpload(filename) {
    return this.makeRequest(
      `/api/upload/abort/${encodeURIComponent(filename)}`,
      {
        method: 'DELETE',
      }
    );
  }
  async deleteFile(fileId) {
    const token = await this.getToken();
    return this.makeRequest(`/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getUsersFiles() {
    try {
      console.log('Calling getUsersFiles API endpoint');
      const result = await this.makeRequest(`/files`, {
        method: 'GET',
      });
      console.log('getUsersFiles API response:', result);
      return result;
    } catch (error) {
      console.error('Error in getUsersFiles:', error);

      // If it's an authentication error, provide more specific handling
      if (
        error.message.includes('401') ||
        error.message.includes('Authentication failed')
      ) {
        throw new Error('Authentication failed. Please log in again.');
      }

      throw error;
    }
  }
  async generate(data) {
    return this.makeRequest('/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async regenerate(data) {
    return this.makeRequest('/regenerate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFollowUpQuestions(data) {
    return this.makeRequest('/follow-up-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateFollowUpQuestions(data) {
    return this.makeRequest('/follow-up-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSectionFields(sectionNumber, tokenType = 'OTH') {
    // Make sure tokenType is uppercase for consistency
    tokenType = tokenType.toUpperCase();
    console.log(
      `Fetching fields for section ${sectionNumber} with token type: ${tokenType}`
    );

    try {
      const result = await this.makeRequest(
        `/api/sections/${sectionNumber}/fields?token_type=${tokenType}`
      );
      console.log(
        `Received ${result.fields?.length || 0} fields for section ${sectionNumber} with token type ${tokenType}`
      );
      return result;
    } catch (error) {
      console.error(
        `Error fetching fields for section ${sectionNumber} with token type ${tokenType}:`,
        error
      );

      // If not already trying OTH, try it as fallback
      if (tokenType !== 'OTH') {
        console.log(
          `Automatically falling back to OTH token type for section ${sectionNumber}`
        );
        return this.getSectionFields(sectionNumber, 'OTH');
      }

      throw error;
    }
  }

  async getSectionField(sectionNumber, fieldId, tokenType = 'OTH') {
    // Make sure tokenType is uppercase for consistency
    tokenType = tokenType.toUpperCase();
    return this.makeRequest(
      `/api/sections/${sectionNumber}/field/${fieldId}?token_type=${tokenType}`
    );
  }

  async getAllSectionFields(tokenType = 'OTH') {
    // Make sure tokenType is uppercase for consistency
    tokenType = tokenType.toUpperCase();
    return this.makeRequest(`/api/all-section-fields?token_type=${tokenType}`);
  }

  async lookupLEI(lei) {
    return this.makeRequest('/api/lei-lookup', {
      method: 'POST',
      body: JSON.stringify({ lei }),
    });
  }

  async lookupELF(elf_code) {
    return this.makeRequest('/api/elf-lookup', {
      method: 'POST',
      body: JSON.stringify({ elf_code }),
    });
  }

  async saveUserContext(auth0UserId, contextData) {
    return this.makeRequest('/api/user-context', {
      method: 'POST',
      body: JSON.stringify({
        auth0_user_id: auth0UserId,
        context_data: contextData,
      }),
    });
  }

  async getUserContext(auth0UserId) {
    return this.makeRequest(`/api/user-context/${auth0UserId}`);
  }

  async saveWhitepaperProgress(generationId, auth0UserId, contextData) {
    return this.makeRequest(`/api/whitepaper/${generationId}/save`, {
      method: 'POST',
      body: JSON.stringify({
        auth0_user_id: auth0UserId,
        context_data: contextData,
      }),
    });
  }

  async resetWhitepaperProgress(generationId) {
    return this.makeRequest(`/api/whitepaper/${generationId}/reset`, {
      method: 'POST',
    });
  }

  async getDummyData() {
    return this.makeRequest('/dummy', {
      method: 'POST',
    });
  }

  async generateFillouts(formData) {
    console.log('Generating fillouts /generate with form data:', formData);
    return this.makeRequest('/generate', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async searchDTI(query, dtiTypeParam) {
    const url = `/api/dti/search?query=${encodeURIComponent(query)}&${dtiTypeParam}`;
    return this.makeRequest(url, { method: 'GET' });
  }

  // DORA Audit API methods
  async generateDoraAudit(auditRequest) {
    console.log('Generating DORA audit with request:', auditRequest);
    return this.makeRequest('/api/dora/generate', {
      method: 'POST',
      body: JSON.stringify(auditRequest),
    });
  }

  async getDoraAuditStatus(auditId) {
    return this.makeRequest(`/api/dora/${auditId}/status`, {
      method: 'GET',
    });
  }

  async listDoraAudits() {
    return this.makeRequest('/api/dora/list', {
      method: 'GET',
    });
  }

  async deleteDoraAudit(auditId) {
    return this.makeRequest(`/api/dora/${auditId}`, {
      method: 'DELETE',
    });
  }

  // Onboarding/User Profile API methods
  async saveOnboardingProfile(profileData) {
    return this.makeRequest('/api/onboarding', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getOnboardingProfile() {
    return this.makeRequest('/api/onboarding', {
      method: 'GET',
    });
  }

  // Vendor API methods
  async listVendors() {
    return this.makeRequest('/api/vendors', {
      method: 'GET',
    });
  }

  async createVendor(vendorData) {
    return this.makeRequest('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async getVendor(vendorId) {
    return this.makeRequest(`/api/vendors/${vendorId}`, {
      method: 'GET',
    });
  }

  async updateVendor(vendorId, vendorData) {
    return this.makeRequest(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  }

  async deleteVendor(vendorId) {
    return this.makeRequest(`/api/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }

  async addVendorContract(vendorId, contractData) {
    return this.makeRequest(`/api/vendors/${vendorId}/contracts`, {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  // Dashboard API methods
  async getDashboardStats() {
    return this.makeRequest('/api/dashboard/stats', {
      method: 'GET',
    });
  }

  // Contract Audit API methods
  async listChecklists() {
    return this.makeRequest('/api/contract-audit/checklists', {
      method: 'GET',
    });
  }

  async startContractAudit(auditData) {
    return this.makeRequest('/api/contract-audit/start', {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
  }

  async getContractAuditStatus(auditId) {
    return this.makeRequest(`/api/contract-audit/${auditId}/status`, {
      method: 'GET',
    });
  }

  async listContractAudits() {
    return this.makeRequest('/api/contract-audit/list', {
      method: 'GET',
    });
  }

  // Chat API methods
  async sendChatMessage(messageData) {
    return this.makeRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async listChatSessions() {
    return this.makeRequest('/api/chat/sessions', {
      method: 'GET',
    });
  }

  async getChatSession(sessionId) {
    return this.makeRequest(`/api/chat/sessions/${sessionId}`, {
      method: 'GET',
    });
  }

  async deleteChatSession(sessionId) {
    return this.makeRequest(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Vendor Qualification API methods
  async getDoraIctServices() {
    return this.makeRequest('/api/dora/ict-services', {
      method: 'GET',
    });
  }

  async startVendorQualification(qualificationData) {
    return this.makeRequest('/api/vendor-qualification/start', {
      method: 'POST',
      body: JSON.stringify(qualificationData),
    });
  }

  async listVendorQualifications() {
    return this.makeRequest('/api/vendor-qualification/list', {
      method: 'GET',
    });
  }

  async getVendorQualification(qualificationId) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}`, {
      method: 'GET',
    });
  }

  async saveQualificationStep(qualificationId, stepNum, stepData) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}/step/${stepNum}`, {
      method: 'PUT',
      body: JSON.stringify(stepData),
    });
  }

  async updateIctProviderStatus(qualificationId, isIctProvider) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}/ict-provider?is_ict_provider=${isIctProvider}`, {
      method: 'PUT',
    });
  }

  async updateServicesMapping(qualificationId, servicesMapping) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}/services-mapping`, {
      method: 'PUT',
      body: JSON.stringify(servicesMapping),
    });
  }

  async generateQualificationAnswer(qualificationId, requestData) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}/generate-answer`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async generateQualificationReport(qualificationId) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}/generate-report`, {
      method: 'POST',
    });
  }

  async deleteVendorQualification(qualificationId) {
    return this.makeRequest(`/api/vendor-qualification/${qualificationId}`, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

// Function to create a new API service instance
export const createApiService = () => {
  return apiService;
};

// Hook to use in React components
export const useApi = () => {
  const auth0 = useAuth0();
  apiService.setAuth0(auth0);
  return apiService;
};

export default apiService;
