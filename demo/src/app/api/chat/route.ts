import { NextRequest, NextResponse } from 'next/server';
import { createWPEngineClient } from '../../../../../src/services/wpengine-api.js';

// Command parser to extract WP Engine commands from natural language
function parseUserMessage(message: string): { command: string; parameters: Record<string, any> } {
  const lowerMessage = message.toLowerCase();

  // List sites patterns
  if (lowerMessage.includes('list') && (lowerMessage.includes('sites') || lowerMessage.includes('websites'))) {
    return { command: 'list_sites', parameters: {} };
  }

  // Get site info patterns
  if (lowerMessage.includes('site') && (lowerMessage.includes('info') || lowerMessage.includes('details'))) {
    const siteIdMatch = message.match(/site\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (siteIdMatch) {
      return { command: 'get_site_info', parameters: { site_id: siteIdMatch[1] } };
    }
  }

  // List accounts patterns
  if (lowerMessage.includes('list') && lowerMessage.includes('accounts')) {
    return { command: 'list_accounts', parameters: {} };
  }

  // Get account patterns
  if (lowerMessage.includes('account') && (lowerMessage.includes('info') || lowerMessage.includes('details'))) {
    const accountIdMatch = message.match(/account\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (accountIdMatch) {
      return { command: 'get_account', parameters: { account_id: accountIdMatch[1] } };
    }
  }

  // List installations patterns
  if (lowerMessage.includes('list') && (lowerMessage.includes('installs') || lowerMessage.includes('installations'))) {
    return { command: 'list_installs', parameters: {} };
  }

  // Get installation patterns
  if ((lowerMessage.includes('install') || lowerMessage.includes('installation')) && (lowerMessage.includes('info') || lowerMessage.includes('details'))) {
    const installIdMatch = message.match(/install(?:ation)?\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (installIdMatch) {
      return { command: 'get_install', parameters: { install_id: installIdMatch[1] } };
    }
  }

  // List domains patterns
  if (lowerMessage.includes('list') && lowerMessage.includes('domains')) {
    const installIdMatch = message.match(/install(?:ation)?\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (installIdMatch) {
      return { command: 'list_domains', parameters: { install_id: installIdMatch[1] } };
    }
  }

  // Create backup patterns
  if (lowerMessage.includes('create') && lowerMessage.includes('backup')) {
    const installIdMatch = message.match(/install(?:ation)?\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (installIdMatch) {
      return { 
        command: 'create_backup', 
        parameters: { 
          install_id: installIdMatch[1],
          description: 'Backup created via chat interface',
          notification_emails: ['admin@example.com']
        } 
      };
    }
  }

  // Purge cache patterns
  if (lowerMessage.includes('purge') && lowerMessage.includes('cache')) {
    const installIdMatch = message.match(/install(?:ation)?\s+(?:id\s+)?([a-f0-9-]+)/i);
    const typeMatch = message.match(/cache\s+(all|object|page|cdn)/i);
    if (installIdMatch) {
      return { 
        command: 'purge_cache', 
        parameters: { 
          install_id: installIdMatch[1],
          type: typeMatch ? typeMatch[1].toLowerCase() : 'all'
        } 
      };
    }
  }

  // List SSH keys patterns
  if (lowerMessage.includes('list') && lowerMessage.includes('ssh')) {
    return { command: 'list_ssh_keys', parameters: {} };
  }

  // API status patterns
  if (lowerMessage.includes('api') && lowerMessage.includes('status')) {
    return { command: 'get_api_status', parameters: {} };
  }

  // Current user patterns
  if (lowerMessage.includes('current') && lowerMessage.includes('user')) {
    return { command: 'get_current_user', parameters: {} };
  }

  // Create site patterns
  if (lowerMessage.includes('create') && lowerMessage.includes('site')) {
    const nameMatch = message.match(/create\s+site\s+(?:named\s+)?([a-zA-Z0-9-_]+)/i);
    if (nameMatch) {
      return { command: 'create_site', parameters: { name: nameMatch[1] } };
    }
  }

  // Update site patterns
  if (lowerMessage.includes('update') && lowerMessage.includes('site')) {
    const siteIdMatch = message.match(/site\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (siteIdMatch) {
      return { command: 'update_site', parameters: { site_id: siteIdMatch[1] } };
    }
  }

  // Delete site patterns
  if (lowerMessage.includes('delete') && lowerMessage.includes('site')) {
    const siteIdMatch = message.match(/site\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (siteIdMatch) {
      return { command: 'delete_site', parameters: { site_id: siteIdMatch[1] } };
    }
  }

  // List account users patterns
  if (lowerMessage.includes('list') && lowerMessage.includes('users')) {
    const accountIdMatch = message.match(/account\s+(?:id\s+)?([a-f0-9-]+)/i);
    if (accountIdMatch) {
      return { command: 'list_account_users', parameters: { account_id: accountIdMatch[1] } };
    }
  }

  // If no pattern matches, return a help command
  return { command: 'help', parameters: {} };
}

// Generate help text for available commands
function generateHelpText(): string {
  return `
Available WP Engine commands:

**Account Management:**
- "list accounts" - List all accounts
- "get account info [account-id]" - Get account details
- "list users for account [account-id]" - List account users

**Site Management:**
- "list sites" - List all sites
- "get site info [site-id]" - Get site details
- "create site named [site-name]" - Create a new site
- "update site [site-id]" - Update site settings
- "delete site [site-id]" - Delete a site

**Installation Management:**
- "list installs" - List all installations
- "get install info [install-id]" - Get installation details
- "list domains for installation [install-id]" - List domains for installation

**Backup Operations:**
- "create backup for installation [install-id]" - Create a backup

**Cache Management:**
- "purge cache for installation [install-id]" - Purge all cache
- "purge [type] cache for installation [install-id]" - Purge specific cache type (all, object, page, cdn)

**SSH Key Management:**
- "list ssh keys" - List all SSH keys

**System Status:**
- "api status" - Check API status
- "current user" - Get current user info

Replace [install-id], [site-id], [account-id] with actual IDs from your WP Engine account.
  `;
}

// Execute command using shared WP Engine API client
async function executeCommand(command: string, parameters: Record<string, any> = {}) {
  const wpengineClient = createWPEngineClient();
  
  try {
    switch (command.toLowerCase()) {
      case 'list_sites':
        return await wpengineClient.listSites();
      case 'get_site_info':
        return await wpengineClient.getSite(parameters.site_id);
      case 'create_site':
        return await wpengineClient.createSite({
          name: parameters.name,
          account_id: parameters.account_id || 'default'
        });
      case 'update_site':
        const { site_id, ...updateData } = parameters;
        return await wpengineClient.updateSite(site_id, updateData);
      case 'delete_site':
        return await wpengineClient.deleteSite(parameters.site_id);
      case 'list_accounts':
        return await wpengineClient.listAccounts();
      case 'get_account':
        return await wpengineClient.getAccount(parameters.account_id);
      case 'list_installs':
        return await wpengineClient.listInstalls();
      case 'get_install':
        return await wpengineClient.getInstall(parameters.install_id);
      case 'list_domains':
        return await wpengineClient.listDomains(parameters.install_id);
      case 'create_backup':
        return await wpengineClient.createBackup(parameters.install_id, {
          description: parameters.description || 'Backup created via chat interface',
          notification_emails: parameters.notification_emails || ['admin@example.com']
        });
      case 'purge_cache':
        return await wpengineClient.purgeCache(parameters.install_id, { type: parameters.type || 'all' });
      case 'list_ssh_keys':
        return await wpengineClient.listSshKeys();
      case 'get_api_status':
        return await wpengineClient.getApiStatus();
      case 'get_current_user':
        return await wpengineClient.getCurrentUser();
      case 'list_account_users':
        return await wpengineClient.listAccountUsers(parameters.account_id);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    throw new Error(`WP Engine API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// API endpoint handler
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Message is required and must be a string' 
      }, { status: 400 });
    }

    const parsedCommand = parseUserMessage(message);

    let response;
    if (parsedCommand.command === 'help') {
      response = {
        type: 'help',
        content: generateHelpText()
      };
    } else {
      try {
        const result = await executeCommand(parsedCommand.command, parsedCommand.parameters);
        response = {
          type: 'success',
          command: parsedCommand.command,
          parameters: parsedCommand.parameters,
          data: result
        };
      } catch (error) {
        response = {
          type: 'error',
          command: parsedCommand.command,
          parameters: parsedCommand.parameters,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}