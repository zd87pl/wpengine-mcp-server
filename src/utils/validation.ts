/**
 * Input validation utilities for WP Engine MCP server
 */

import { z } from 'zod';

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(): void {
  const username = process.env.WPENGINE_USERNAME;
  const password = process.env.WPENGINE_PASSWORD;
  
  if (!username || !password) {
    throw new Error('WPENGINE_USERNAME and WPENGINE_PASSWORD environment variables are required. Get these from your WP Engine Portal API Access page.');
  }
  
  if (typeof username !== 'string' || username.length === 0) {
    throw new Error('WPENGINE_USERNAME must be a non-empty string');
  }
  
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('WPENGINE_PASSWORD must be a non-empty string');
  }
}

/**
 * Generic input validation function
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

// Common validation patterns
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const installNamePattern = /^[a-z][a-z0-9]{2,13}$/;
const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const environmentTypes = ['production', 'staging', 'development'] as const;
const cacheTypes = ['object', 'page', 'cdn', 'all'] as const;
const userRoles = ['owner', 'full', 'full,billing', 'partial', 'partial,billing'] as const;

// Core API validation schemas

export const getApiStatusSchema = z.object({
  // No input parameters required
});

export const getCurrentUserSchema = z.object({
  // No input parameters required
});

// Account validation schemas

export const listAccountsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0)
});

export const getAccountSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id')
});

// Site validation schemas

export const listSitesSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0),
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id').optional()
});

export const getSiteSchema = z.object({
  site_id: z.string().regex(uuidPattern, 'Invalid UUID format for site_id')
});

export const createSiteSchema = z.object({
  name: z.string().min(3).max(50),
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id')
});

export const updateSiteSchema = z.object({
  site_id: z.string().regex(uuidPattern, 'Invalid UUID format for site_id'),
  name: z.string().min(3).max(50).optional()
});

export const deleteSiteSchema = z.object({
  site_id: z.string().regex(uuidPattern, 'Invalid UUID format for site_id')
});

// Installation validation schemas

export const listInstallsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0),
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id').optional()
});

export const getInstallSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id')
});

export const createInstallSchema = z.object({
  name: z.string().regex(installNamePattern, 'Install name must be 3-14 characters, lowercase letters and numbers, starting with letter'),
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id'),
  site_id: z.string().regex(uuidPattern, 'Invalid UUID format for site_id').optional(),
  environment: z.enum(environmentTypes).optional()
});

export const updateInstallSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  site_id: z.string().regex(uuidPattern, 'Invalid UUID format for site_id').optional(),
  environment: z.enum(environmentTypes).optional()
});

export const deleteInstallSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id')
});

// Domain validation schemas

export const listDomainsSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0)
});

export const getDomainSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  domain_id: z.string().regex(uuidPattern, 'Invalid UUID format for domain_id')
});

export const createDomainSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  name: z.string().regex(domainPattern, 'Invalid domain name format'),
  primary: z.boolean().optional(),
  redirect_to: z.string().regex(uuidPattern, 'Invalid UUID format for redirect_to').optional()
});

export const updateDomainSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  domain_id: z.string().regex(uuidPattern, 'Invalid UUID format for domain_id'),
  primary: z.boolean().optional(),
  redirect_to: z.string().optional(),
  secure_all_urls: z.boolean().optional()
});

export const deleteDomainSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  domain_id: z.string().regex(uuidPattern, 'Invalid UUID format for domain_id')
});

// Backup validation schemas

export const createBackupSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  description: z.string().min(1).max(200),
  notification_emails: z.array(z.string().regex(emailPattern, 'Invalid email format')).min(1).max(10)
});

export const getBackupSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  backup_id: z.string().regex(uuidPattern, 'Invalid UUID format for backup_id')
});

// Cache validation schemas

export const purgeCacheSchema = z.object({
  install_id: z.string().regex(uuidPattern, 'Invalid UUID format for install_id'),
  type: z.enum(cacheTypes)
});

// Account User validation schemas

export const listAccountUsersSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id')
});

export const getAccountUserSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id'),
  user_id: z.string().regex(uuidPattern, 'Invalid UUID format for user_id')
});

export const createAccountUserSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id'),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().regex(emailPattern, 'Invalid email format'),
  roles: z.enum(userRoles),
  install_ids: z.array(z.string().regex(uuidPattern, 'Invalid UUID format for install_id')).optional()
});

export const updateAccountUserSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id'),
  user_id: z.string().regex(uuidPattern, 'Invalid UUID format for user_id'),
  roles: z.enum(userRoles),
  install_ids: z.array(z.string().regex(uuidPattern, 'Invalid UUID format for install_id')).optional()
});

export const deleteAccountUserSchema = z.object({
  account_id: z.string().regex(uuidPattern, 'Invalid UUID format for account_id'),
  user_id: z.string().regex(uuidPattern, 'Invalid UUID format for user_id')
});

// SSH Key validation schemas

export const listSshKeysSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0)
});

export const createSshKeySchema = z.object({
  public_key: z.string().min(100).max(2000) // SSH public keys are typically 200-800 characters
});

export const deleteSshKeySchema = z.object({
  ssh_key_id: z.string().regex(uuidPattern, 'Invalid UUID format for ssh_key_id')
});

// Legacy compatibility schemas (for backward compatibility)
export const getSiteInfoSchema = getSiteSchema;
export const listSitesSchema_legacy = listSitesSchema;
export const createSiteSchema_legacy = createSiteSchema;
export const updateSiteSchema_legacy = updateSiteSchema;
export const deleteSiteSchema_legacy = deleteSiteSchema;