/**
 * WP Engine API client service
 * Handles all interactions with the WP Engine API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  WPEngineApiResponse,
  WPEngineSite,
  CreateSiteRequest,
  UpdateSiteRequest,
  WPEngineApiError,
  SiteListResponse,
  WPEngineAuthConfig,
} from '../types/wpengine.js';

export class WPEngineApiClient {
  private client: AxiosInstance;
  private config: WPEngineAuthConfig;

  constructor(config: WPEngineAuthConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.error(`[WPEngine API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[WPEngine API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[WPEngine API] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Handle API errors and transform them into user-friendly messages
   */
  private handleApiError(error: AxiosError): Error {
    if (error.response?.status === 401) {
      return new Error('WP Engine API authentication failed. Please check your API token.');
    }
    
    if (error.response?.status === 403) {
      return new Error('WP Engine API access forbidden. Please check your permissions.');
    }
    
    if (error.response?.status === 404) {
      return new Error('WP Engine API endpoint not found or resource does not exist.');
    }
    
    if (error.response?.status === 429) {
      return new Error('WP Engine API rate limit exceeded. Please try again later.');
    }
    
    if (error.response?.status && error.response.status >= 500) {
      return new Error('WP Engine API server error. Please try again later.');
    }

    const apiError = error.response?.data as WPEngineApiError;
    if (apiError?.error?.message) {
      return new Error(`WP Engine API error: ${apiError.error.message}`);
    }

    return new Error(`WP Engine API error: ${error.message}`);
  }

  /**
   * Validate API connection by making a test request
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get('/user');
      console.error('[WPEngine API] Connection validated successfully');
      return true;
    } catch (error) {
      console.error('[WPEngine API] Connection validation failed:', error);
      return false;
    }
  }

  /**
   * List all sites for the authenticated user
   */
  async listSites(): Promise<WPEngineSite[]> {
    try {
      const response = await this.client.get<WPEngineApiResponse<SiteListResponse>>('/sites');
      return response.data.data.sites;
    } catch (error) {
      throw new Error(`Failed to list sites: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific site
   */
  async getSiteInfo(siteId: string): Promise<WPEngineSite> {
    try {
      const response = await this.client.get<WPEngineApiResponse<WPEngineSite>>(`/sites/${siteId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get site info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new WordPress site
   */
  async createSite(siteData: CreateSiteRequest): Promise<WPEngineSite> {
    try {
      const response = await this.client.post<WPEngineApiResponse<WPEngineSite>>('/sites', siteData);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to create site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing site
   */
  async updateSite(siteId: string, updateData: UpdateSiteRequest): Promise<WPEngineSite> {
    try {
      const response = await this.client.put<WPEngineApiResponse<WPEngineSite>>(`/sites/${siteId}`, updateData);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to update site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a site
   */
  async deleteSite(siteId: string): Promise<void> {
    try {
      await this.client.delete(`/sites/${siteId}`);
    } catch (error) {
      throw new Error(`Failed to delete site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get site statistics (if available)
   */
  async getSiteStats(siteId: string): Promise<any> {
    try {
      const response = await this.client.get<WPEngineApiResponse<any>>(`/sites/${siteId}/stats`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get site stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List site backups (if available)
   */
  async listSiteBackups(siteId: string): Promise<any[]> {
    try {
      const response = await this.client.get<WPEngineApiResponse<any[]>>(`/sites/${siteId}/backups`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to list site backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Create and configure WP Engine API client
 */
export function createWPEngineClient(): WPEngineApiClient {
  const apiToken = process.env.WPENGINE_API_TOKEN;
  if (!apiToken) {
    throw new Error('WPENGINE_API_TOKEN environment variable is required');
  }

  const config: WPEngineAuthConfig = {
    apiToken,
    baseUrl: process.env.WPENGINE_API_BASE_URL || 'https://api.wpengineapi.com/v1',
    timeout: parseInt(process.env.WPENGINE_REQUEST_TIMEOUT || '30000', 10),
  };

  return new WPEngineApiClient(config);
}