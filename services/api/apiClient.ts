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
    const url = new URL(endpoint, this.baseUrl);
    
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await this.fetchWithRetry(url.toString(), {
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
    const url = new URL(endpoint, this.baseUrl);

    const response = await this.fetchWithRetry(url.toString(), {
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