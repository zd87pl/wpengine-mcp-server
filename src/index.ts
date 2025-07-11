#!/usr/bin/env node

/**
 * WP Engine MCP Server
 *
 * This MCP server provides site management capabilities for WP Engine managed WordPress platform.
 * It implements tools for:
 * - Listing sites
 * - Getting site information
 * - Creating new sites
 * - Updating existing sites
 * - Deleting sites
 *
 * Supports both local (stdio) and remote (HTTP) deployment modes.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createWPEngineClient } from './services/wpengine-api.js';
import { validateEnvironmentConfig, validateInput } from './utils/validation.js';
import {
  listSitesSchema,
  getSiteInfoSchema,
  createSiteSchema,
  updateSiteSchema,
  deleteSiteSchema,
} from './utils/validation.js';

// Validate environment configuration on startup
try {
  validateEnvironmentConfig();
} catch (error) {
  console.error('Environment configuration error:', error instanceof Error ? error.message : error);
  process.exit(1);
}

// Create WP Engine API client
const wpengineClient = createWPEngineClient();

/**
 * Create the MCP server with WP Engine capabilities
 */
const server = new Server(
  {
    name: "wpengine-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools for WP Engine site management
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_sites",
        description: "List all WP Engine sites in your account",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_site_info",
        description: "Get detailed information about a specific WP Engine site",
        inputSchema: {
          type: "object",
          properties: {
            site_id: {
              type: "string",
              description: "The ID of the site to get information for"
            }
          },
          required: ["site_id"]
        }
      },
      {
        name: "create_site",
        description: "Create a new WordPress site on WP Engine",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the new site"
            },
            environment: {
              type: "string",
              enum: ["production", "staging", "development"],
              description: "Environment type for the site (default: production)"
            },
            php_version: {
              type: "string",
              description: "PHP version for the site (e.g., '8.1', '8.2')"
            },
            wp_version: {
              type: "string",
              description: "WordPress version for the site"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "update_site",
        description: "Update an existing WP Engine site",
        inputSchema: {
          type: "object",
          properties: {
            site_id: {
              type: "string",
              description: "The ID of the site to update"
            },
            name: {
              type: "string",
              description: "New name for the site"
            },
            php_version: {
              type: "string",
              description: "New PHP version for the site"
            },
            wp_version: {
              type: "string",
              description: "New WordPress version for the site"
            },
            backup_enabled: {
              type: "boolean",
              description: "Enable or disable backups"
            },
            cdn_enabled: {
              type: "boolean",
              description: "Enable or disable CDN"
            },
            ssl_enabled: {
              type: "boolean",
              description: "Enable or disable SSL"
            }
          },
          required: ["site_id"]
        }
      },
      {
        name: "delete_site",
        description: "Delete a WP Engine site",
        inputSchema: {
          type: "object",
          properties: {
            site_id: {
              type: "string",
              description: "The ID of the site to delete"
            }
          },
          required: ["site_id"]
        }
      }
    ]
  };
});

/**
 * Handler for WP Engine site management tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "list_sites": {
        const validatedInput = validateInput(listSitesSchema, request.params.arguments || {});
        const sites = await wpengineClient.listSites();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              data: sites
            }, null, 2)
          }]
        };
      }

      case "get_site_info": {
        const validatedInput = validateInput(getSiteInfoSchema, request.params.arguments);
        const siteInfo = await wpengineClient.getSite(validatedInput.site_id);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              data: siteInfo
            }, null, 2)
          }]
        };
      }

      case "create_site": {
        const validatedInput = validateInput(createSiteSchema, request.params.arguments);
        const newSite = await wpengineClient.createSite({
          name: validatedInput.name,
          account_id: validatedInput.account_id,
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Site '${newSite.name}' created successfully`,
              data: newSite
            }, null, 2)
          }]
        };
      }

      case "update_site": {
        const validatedInput = validateInput(updateSiteSchema, request.params.arguments);
        const { site_id, ...updateData } = validatedInput;
        const updatedSite = await wpengineClient.updateSite(site_id, updateData);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Site '${updatedSite.name}' updated successfully`,
              data: updatedSite
            }, null, 2)
          }]
        };
      }

      case "delete_site": {
        const validatedInput = validateInput(deleteSiteSchema, request.params.arguments);
        await wpengineClient.deleteSite(validatedInput.site_id);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Site with ID '${validatedInput.site_id}' deleted successfully`
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error(`Tool execution error (${request.params.name}):`, error);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, null, 2)
      }],
      isError: true
    };
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  try {
    // Test API connection before starting
    const isConnected = await wpengineClient.validateConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to WP Engine API. Please check your credentials.');
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('WP Engine MCP server running on stdio');
  } catch (error) {
    console.error('Server startup error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
