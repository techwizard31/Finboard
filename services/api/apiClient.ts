import { useApiStore } from '@/stores/apiStore';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 30000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries reached');
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    let url: string;
    
    if (endpoint.startsWith('http')) {
      // External URL
      const urlObj = new URL(endpoint);
      if (options?.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, value);
        });
      }
      url = urlObj.toString();
    } else {
      // Internal Next.js API route
      url = endpoint;
      if (options?.params) {
        const params = new URLSearchParams(options.params);
        url += `?${params.toString()}`;
      }
    }

    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    return response.json();
  }

  async post<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    let url: string;
    
    if (endpoint.startsWith('http')) {
      // External URL
      url = new URL(endpoint).toString();
    } else {
      // Internal Next.js API route
      url = endpoint;
    }

    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    return response.json();
  }
}

export const apiClient = new ApiClient();