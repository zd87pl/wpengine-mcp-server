/**
 * WP Engine API client service
 * Handles all interactions with the WP Engine API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  WPEngineApiError,
  WPEngineAuthConfig,
  ApiStatus,
  User,
  Account,
  PaginatedResponse,
  Site,
  Installation,
  Domain,
  Backup,
  SshKey,
  AccountUser,
  CreateSiteRequest,
  UpdateSiteRequest,
  CreateInstallRequest,
  UpdateInstallRequest,
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateBackupRequest,
  PurgeCacheRequest,
  CreateAccountUserRequest,
  UpdateAccountUserRequest,
  CreateSshKeyRequest,
} from '../types/wpengine.js';

export class WPEngineApiClient {
  private client: AxiosInstance;
  private config: WPEngineAuthConfig;

  constructor(config: WPEngineAuthConfig) {
    this.config = config;
    
    // Create Basic Auth header
    const authToken = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Basic ${authToken}`,
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
      return new Error('WP Engine API authentication failed. Please check your username and password from the API Access page.');
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
    if (apiError?.message) {
      return new Error(`WP Engine API error: ${apiError.message}`);
    }

    return new Error(`WP Engine API error: ${error.message}`);
  }

  // Core API methods
  
  /**
   * Get API status
   */
  async getApiStatus(): Promise<ApiStatus> {
    try {
      const response = await this.client.get<ApiStatus>('/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get API status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<User>('/user');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Account methods

  /**
   * List all accounts for the authenticated user
   */
  async listAccounts(limit?: number, offset?: number): Promise<PaginatedResponse<Account>> {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());

      const response = await this.client.get<PaginatedResponse<Account>>(`/accounts?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific account
   */
  async getAccount(accountId: string): Promise<Account> {
    try {
      const response = await this.client.get<Account>(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Site methods

  /**
   * List all sites for the authenticated user
   */
  async listSites(limit?: number, offset?: number, accountId?: string): Promise<PaginatedResponse<Site>> {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());
      if (accountId) params.append('account_id', accountId);

      const response = await this.client.get<PaginatedResponse<Site>>(`/sites?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list sites: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific site
   */
  async getSite(siteId: string): Promise<Site> {
    try {
      const response = await this.client.get<Site>(`/sites/${siteId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get site info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new WordPress site
   */
  async createSite(siteData: CreateSiteRequest): Promise<Site> {
    try {
      const response = await this.client.post<Site>('/sites', siteData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing site
   */
  async updateSite(siteId: string, updateData: UpdateSiteRequest): Promise<Site> {
    try {
      const response = await this.client.patch<Site>(`/sites/${siteId}`, updateData);
      return response.data;
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

  // Installation methods

  /**
   * List all WordPress installations
   */
  async listInstalls(limit?: number, offset?: number, accountId?: string): Promise<PaginatedResponse<Installation>> {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());
      if (accountId) params.append('account_id', accountId);

      const response = await this.client.get<PaginatedResponse<Installation>>(`/installs?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list installations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific installation
   */
  async getInstall(installId: string): Promise<Installation> {
    try {
      const response = await this.client.get<Installation>(`/installs/${installId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get installation info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new WordPress installation
   */
  async createInstall(installData: CreateInstallRequest): Promise<Installation> {
    try {
      const response = await this.client.post<Installation>('/installs', installData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create installation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing installation
   */
  async updateInstall(installId: string, updateData: UpdateInstallRequest): Promise<Installation> {
    try {
      const response = await this.client.patch<Installation>(`/installs/${installId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update installation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an installation
   */
  async deleteInstall(installId: string): Promise<void> {
    try {
      await this.client.delete(`/installs/${installId}`);
    } catch (error) {
      throw new Error(`Failed to delete installation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Domain methods

  /**
   * List domains for an installation
   */
  async listDomains(installId: string, limit?: number, offset?: number): Promise<PaginatedResponse<Domain>> {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());

      const response = await this.client.get<PaginatedResponse<Domain>>(`/installs/${installId}/domains?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list domains: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific domain
   */
  async getDomain(installId: string, domainId: string): Promise<Domain> {
    try {
      const response = await this.client.get<Domain>(`/installs/${installId}/domains/${domainId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get domain info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new domain for an installation
   */
  async createDomain(installId: string, domainData: CreateDomainRequest): Promise<Domain> {
    try {
      const response = await this.client.post<Domain>(`/installs/${installId}/domains`, domainData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing domain
   */
  async updateDomain(installId: string, domainId: string, updateData: UpdateDomainRequest): Promise<Domain> {
    try {
      const response = await this.client.patch<Domain>(`/installs/${installId}/domains/${domainId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a domain
   */
  async deleteDomain(installId: string, domainId: string): Promise<void> {
    try {
      await this.client.delete(`/installs/${installId}/domains/${domainId}`);
    } catch (error) {
      throw new Error(`Failed to delete domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Backup methods

  /**
   * Create a backup for an installation
   */
  async createBackup(installId: string, backupData: CreateBackupRequest): Promise<Backup> {
    try {
      const response = await this.client.post<Backup>(`/installs/${installId}/backups`, backupData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get backup status
   */
  async getBackup(installId: string, backupId: string): Promise<Backup> {
    try {
      const response = await this.client.get<Backup>(`/installs/${installId}/backups/${backupId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get backup status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cache methods

  /**
   * Purge cache for an installation
   */
  async purgeCache(installId: string, cacheData: PurgeCacheRequest): Promise<void> {
    try {
      await this.client.post(`/installs/${installId}/purge_cache`, cacheData);
    } catch (error) {
      throw new Error(`Failed to purge cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Account User methods

  /**
   * List account users
   */
  async listAccountUsers(accountId: string): Promise<{results: AccountUser[]}> {
    try {
      const response = await this.client.get<{results: AccountUser[]}>(`/accounts/${accountId}/account_users`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list account users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account user information
   */
  async getAccountUser(accountId: string, userId: string): Promise<AccountUser> {
    try {
      const response = await this.client.get<AccountUser>(`/accounts/${accountId}/account_users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get account user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create account user
   */
  async createAccountUser(accountId: string, userData: CreateAccountUserRequest): Promise<{message: string; account_user: AccountUser}> {
    try {
      const response = await this.client.post<{message: string; account_user: AccountUser}>(`/accounts/${accountId}/account_users`, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create account user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update account user
   */
  async updateAccountUser(accountId: string, userId: string, userData: UpdateAccountUserRequest): Promise<{message: string; account_user: AccountUser}> {
    try {
      const response = await this.client.patch<{message: string; account_user: AccountUser}>(`/accounts/${accountId}/account_users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update account user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete account user
   */
  async deleteAccountUser(accountId: string, userId: string): Promise<void> {
    try {
      await this.client.delete(`/accounts/${accountId}/account_users/${userId}`);
    } catch (error) {
      throw new Error(`Failed to delete account user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SSH Key methods

  /**
   * List SSH keys
   */
  async listSshKeys(limit?: number, offset?: number): Promise<PaginatedResponse<SshKey>> {
    try {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());

      const response = await this.client.get<PaginatedResponse<SshKey>>(`/ssh_keys?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list SSH keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create SSH key
   */
  async createSshKey(keyData: CreateSshKeyRequest): Promise<SshKey> {
    try {
      const response = await this.client.post<SshKey>('/ssh_keys', keyData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create SSH key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete SSH key
   */
  async deleteSshKey(keyId: string): Promise<void> {
    try {
      await this.client.delete(`/ssh_keys/${keyId}`);
    } catch (error) {
      throw new Error(`Failed to delete SSH key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Create and configure WP Engine API client
 */
export function createWPEngineClient(): WPEngineApiClient {
  const username = process.env.WPENGINE_AUTH_TOKEN_ID;
  const password = process.env.WPENGINE_AUTH_PASSWORD;
  
  if (!username || !password) {
    throw new Error('WPENGINE_AUTH_TOKEN_ID and WPENGINE_AUTH_PASSWORD environment variables are required. Get these from your WP Engine Portal API Access page.');
  }

  const config: WPEngineAuthConfig = {
    username,
    password,
    baseUrl: process.env.WPENGINE_API_BASE_URL || 'https://api.wpengineapi.com/v1',
    timeout: parseInt(process.env.WPENGINE_REQUEST_TIMEOUT || '30000', 10),
  };

  return new WPEngineApiClient(config);
}