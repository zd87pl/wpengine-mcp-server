/**
 * TypeScript type definitions for WP Engine API responses
 * Based on WP Engine API v1 specification
 */

// Base API response structure
export interface WPEngineApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// API Error response structure
export interface WPEngineApiError {
  message: string;
  code?: string;
  details?: any;
}

// Pagination structure
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
  limit: number;
  offset: number;
}

// API Status
export interface ApiStatus {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

// User information
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  created_on: string;
  last_access?: string;
}

// Account information
export interface Account {
  id: string;
  name: string;
  created_on: string;
  status: 'active' | 'suspended' | 'cancelled';
  type: 'standard' | 'enterprise' | 'agency';
  billing_contact?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

// Site information (legacy compatibility)
export interface Site {
  id: string;
  name: string;
  account_id: string;
  created_on: string;
  status: 'active' | 'suspended' | 'cancelled';
  php_version?: string;
  primary_domain?: string;
  install_ids: string[];
}

// Installation information (primary WP Engine concept)
export interface Installation {
  id: string;
  name: string;
  account_id: string;
  site_id?: string;
  created_on: string;
  status: 'active' | 'suspended' | 'cancelled';
  environment: 'production' | 'staging' | 'development';
  php_version: string;
  wordpress_version?: string;
  primary_domain?: string;
  cname?: string;
  is_multisite: boolean;
  git_push_mode?: 'disabled' | 'normal' | 'staged';
  backup_enabled: boolean;
  cdn_enabled: boolean;
  ssl_enabled: boolean;
  wpe_common_mu_plugin_enabled: boolean;
  disk_usage_bytes?: number;
  bandwidth_usage_bytes?: number;
  monthly_pageviews?: number;
}

// Domain information
export interface Domain {
  id: string;
  name: string;
  install_id: string;
  primary: boolean;
  redirect_to?: string;
  ssl_enabled: boolean;
  ssl_cert_expires?: string;
  created_on: string;
  status: 'active' | 'pending' | 'failed';
}

// Backup information
export interface Backup {
  id: string;
  install_id: string;
  description: string;
  created_on: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: 'manual' | 'automatic';
  size_bytes?: number;
  expires_on?: string;
  download_url?: string;
}

// SSH Key information
export interface SshKey {
  id: string;
  public_key: string;
  fingerprint: string;
  created_on: string;
  last_used?: string;
}

// Account User information
export interface AccountUser {
  id: string;
  account_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string;
  install_ids?: string[];
  created_on: string;
  last_access?: string;
}

// Request types for API operations

// Site operations
export interface CreateSiteRequest {
  name: string;
  account_id: string;
}

export interface UpdateSiteRequest {
  name?: string;
}

// Installation operations
export interface CreateInstallRequest {
  name: string;
  account_id: string;
  site_id?: string;
  environment?: 'production' | 'staging' | 'development';
}

export interface UpdateInstallRequest {
  site_id?: string;
  environment?: 'production' | 'staging' | 'development';
}

// Domain operations
export interface CreateDomainRequest {
  name: string;
  primary?: boolean;
  redirect_to?: string;
}

export interface UpdateDomainRequest {
  primary?: boolean;
  redirect_to?: string;
  secure_all_urls?: boolean;
}

// Backup operations
export interface CreateBackupRequest {
  description: string;
  notification_emails: string[];
}

// Cache operations
export interface PurgeCacheRequest {
  type: 'object' | 'page' | 'cdn' | 'all';
}

// Account User operations
export interface CreateAccountUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  roles: 'owner' | 'full' | 'full,billing' | 'partial' | 'partial,billing';
  install_ids?: string[];
}

export interface UpdateAccountUserRequest {
  roles: 'owner' | 'full' | 'full,billing' | 'partial' | 'partial,billing';
  install_ids?: string[];
}

// SSH Key operations
export interface CreateSshKeyRequest {
  public_key: string;
}

// Authentication configuration
export interface WPEngineAuthConfig {
  username: string;
  password: string;
  baseUrl: string;
  timeout: number;
}

// Tool input validation types
export interface ListAccountsInput {
  limit?: number;
  offset?: number;
}

export interface GetAccountInput {
  account_id: string;
}

export interface ListSitesInput {
  limit?: number;
  offset?: number;
  account_id?: string;
}

export interface GetSiteInput {
  site_id: string;
}

export interface CreateSiteInput {
  name: string;
  account_id: string;
}

export interface UpdateSiteInput {
  site_id: string;
  name?: string;
}

export interface DeleteSiteInput {
  site_id: string;
}

export interface ListInstallsInput {
  limit?: number;
  offset?: number;
  account_id?: string;
}

export interface GetInstallInput {
  install_id: string;
}

export interface CreateInstallInput {
  name: string;
  account_id: string;
  site_id?: string;
  environment?: 'production' | 'staging' | 'development';
}

export interface UpdateInstallInput {
  install_id: string;
  site_id?: string;
  environment?: 'production' | 'staging' | 'development';
}

export interface DeleteInstallInput {
  install_id: string;
}

export interface ListDomainsInput {
  install_id: string;
  limit?: number;
  offset?: number;
}

export interface GetDomainInput {
  install_id: string;
  domain_id: string;
}

export interface CreateDomainInput {
  install_id: string;
  name: string;
  primary?: boolean;
  redirect_to?: string;
}

export interface UpdateDomainInput {
  install_id: string;
  domain_id: string;
  primary?: boolean;
  redirect_to?: string;
  secure_all_urls?: boolean;
}

export interface DeleteDomainInput {
  install_id: string;
  domain_id: string;
}

export interface CreateBackupInput {
  install_id: string;
  description: string;
  notification_emails: string[];
}

export interface GetBackupInput {
  install_id: string;
  backup_id: string;
}

export interface PurgeCacheInput {
  install_id: string;
  type: 'object' | 'page' | 'cdn' | 'all';
}

export interface ListAccountUsersInput {
  account_id: string;
}

export interface GetAccountUserInput {
  account_id: string;
  user_id: string;
}

export interface CreateAccountUserInput {
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: 'owner' | 'full' | 'full,billing' | 'partial' | 'partial,billing';
  install_ids?: string[];
}

export interface UpdateAccountUserInput {
  account_id: string;
  user_id: string;
  roles: 'owner' | 'full' | 'full,billing' | 'partial' | 'partial,billing';
  install_ids?: string[];
}

export interface DeleteAccountUserInput {
  account_id: string;
  user_id: string;
}

export interface ListSshKeysInput {
  limit?: number;
  offset?: number;
}

export interface CreateSshKeyInput {
  public_key: string;
}

export interface DeleteSshKeyInput {
  ssh_key_id: string;
}

// Legacy compatibility types
export interface WPEngineSite extends Site {}
export interface SiteListResponse extends PaginatedResponse<Site> {}
export interface WPEngineApiResponse_Legacy<T = any> extends WPEngineApiResponse<T> {}

// Legacy input types for backward compatibility
export interface GetSiteInfoInput extends GetSiteInput {}
export interface CreateSiteInput_Legacy extends CreateSiteInput {}
export interface UpdateSiteInput_Legacy extends UpdateSiteInput {}
export interface DeleteSiteInput_Legacy extends DeleteSiteInput {}