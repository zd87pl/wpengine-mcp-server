/**
 * TypeScript type definitions for WP Engine API responses
 */

// Base API response structure
export interface WPEngineApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// Site information structure
export interface WPEngineSite {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  php_version: string;
  environment: 'production' | 'staging' | 'development';
  primary_domain: string;
  cname: string;
  install_id: string;
  account_id: string;
  backup_enabled: boolean;
  cdn_enabled: boolean;
  ssl_enabled: boolean;
  git_enabled: boolean;
  wp_version?: string;
  disk_usage?: number;
  bandwidth_usage?: number;
  monthly_pageviews?: number;
}

// Site creation request
export interface CreateSiteRequest {
  name: string;
  environment?: 'production' | 'staging' | 'development';
  php_version?: string;
  wp_version?: string;
  account_id?: string;
}

// Site update request
export interface UpdateSiteRequest {
  name?: string;
  php_version?: string;
  wp_version?: string;
  backup_enabled?: boolean;
  cdn_enabled?: boolean;
  ssl_enabled?: boolean;
}

// API Error response structure
export interface WPEngineApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  success: false;
}

// Site list response
export interface SiteListResponse {
  sites: WPEngineSite[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// Authentication types
export interface WPEngineAuthConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
}

// Tool input validation schemas
export interface ListSitesInput {
  // No parameters needed for listing all sites
}

export interface GetSiteInfoInput {
  site_id: string;
}

export interface CreateSiteInput {
  name: string;
  environment?: 'production' | 'staging' | 'development';
  php_version?: string;
  wp_version?: string;
}

export interface UpdateSiteInput {
  site_id: string;
  name?: string;
  php_version?: string;
  wp_version?: string;
  backup_enabled?: boolean;
  cdn_enabled?: boolean;
  ssl_enabled?: boolean;
}

export interface DeleteSiteInput {
  site_id: string;
}