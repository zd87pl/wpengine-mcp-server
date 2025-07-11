/**
 * Input validation utilities using Zod schemas
 */

import { z } from 'zod';

// Validation schema for listing sites
export const listSitesSchema = z.object({
  // No parameters needed for listing sites
});

// Validation schema for getting site info
export const getSiteInfoSchema = z.object({
  site_id: z.string().min(1, 'Site ID is required'),
});

// Validation schema for creating a site
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(50, 'Site name must be less than 50 characters'),
  environment: z.enum(['production', 'staging', 'development']).optional().default('production'),
  php_version: z.string().optional(),
  wp_version: z.string().optional(),
});

// Validation schema for updating a site
export const updateSiteSchema = z.object({
  site_id: z.string().min(1, 'Site ID is required'),
  name: z.string().min(1, 'Site name is required').max(50, 'Site name must be less than 50 characters').optional(),
  php_version: z.string().optional(),
  wp_version: z.string().optional(),
  backup_enabled: z.boolean().optional(),
  cdn_enabled: z.boolean().optional(),
  ssl_enabled: z.boolean().optional(),
});

// Validation schema for deleting a site
export const deleteSiteSchema = z.object({
  site_id: z.string().min(1, 'Site ID is required'),
});

/**
 * Generic validation function that uses Zod schemas
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join(', ');
    throw new Error(`Invalid input: ${errors}`);
  }
  return result.data;
}

/**
 * Validate environment variable configuration
 */
export function validateEnvironmentConfig(): void {
  const apiToken = process.env.WPENGINE_API_TOKEN;
  if (!apiToken) {
    throw new Error('WPENGINE_API_TOKEN environment variable is required');
  }
  
  if (apiToken.length < 10) {
    throw new Error('WPENGINE_API_TOKEN appears to be invalid (too short)');
  }
  
  const baseUrl = process.env.WPENGINE_API_BASE_URL || 'https://api.wpengineapi.com/v1';
  if (!baseUrl.startsWith('https://')) {
    throw new Error('WPENGINE_API_BASE_URL must be a valid HTTPS URL');
  }
  
  const timeout = process.env.WPENGINE_REQUEST_TIMEOUT;
  if (timeout && isNaN(parseInt(timeout, 10))) {
    throw new Error('WPENGINE_REQUEST_TIMEOUT must be a valid number');
  }
}