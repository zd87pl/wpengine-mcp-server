# WP Engine MCP Server

A Model Context Protocol (MCP) server that provides site management capabilities for WP Engine managed WordPress platform.

## Features

This MCP server provides the following tools for WP Engine site management:

- **list_sites** - List all sites in your WP Engine account
- **get_site_info** - Get detailed information about a specific site
- **create_site** - Create a new WordPress site
- **update_site** - Update existing site settings
- **delete_site** - Delete a site

## Installation

### Prerequisites

- Node.js (v18 or higher)
- WP Engine account with API access
- WP Engine API token

### Setup

1. **Clone/Download the server code**:
   ```bash
   # Clone or download the server to your desired location
   cd /path/to/your/mcp-servers
   # If cloning from git repository
   git clone <repository-url> wpengine-mcp-server
   cd wpengine-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the server**:
   ```bash
   npm run build
   ```

4. **Get your WP Engine API token**:
   - Log into your WP Engine account
   - Navigate to the API section in your dashboard
   - Generate a new API token
   - Copy the token for configuration

## Configuration

### Claude Desktop Configuration

The server is configured in your Claude Desktop app. Update the configuration file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

Replace the path with your actual server location and add your WP Engine API token:

```json
{
  "mcpServers": {
    "wpengine-mcp-server": {
      "command": "node",
      "args": [
        "/path/to/your/wpengine-mcp-server/build/index.js"
      ],
      "env": {
        "WPENGINE_API_TOKEN": "your-actual-wpengine-api-token"
      },
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

### Environment Variables

The server supports the following environment variables:

- `WPENGINE_API_TOKEN` (required) - Your WP Engine API token
- `WPENGINE_API_BASE_URL` (optional) - API base URL (default: https://api.wpengineapi.com/v1)
- `WPENGINE_REQUEST_TIMEOUT` (optional) - Request timeout in ms (default: 30000)

## Deployment

### WP Engine Atlas Deployment

WP Engine Atlas is a modern headless WordPress platform that supports Node.js applications. You can deploy this MCP server on Atlas for production use.

#### Prerequisites for Atlas Deployment

1. **WP Engine Atlas Account** - Sign up at [wpengine.com/atlas](https://wpengine.com/atlas)
2. **Atlas CLI** - Install the Atlas CLI tool
3. **Node.js 18+** - Ensure your Atlas environment supports Node.js 18 or higher

#### Atlas Deployment Steps

1. **Prepare for Atlas**:
   ```bash
   # Create atlas-specific configuration
   cp package.json package.json.backup
   ```

2. **Add Atlas Configuration** to `package.json`:
   ```json
   {
     "name": "wpengine-mcp-server",
     "version": "0.1.0",
     "description": "MCP Server for WP Engine API",
     "main": "build/index.js",
     "scripts": {
       "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
       "start": "node build/index.js",
       "dev": "npm run build && npm start",
       "atlas:build": "npm run build",
       "atlas:start": "npm start"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Create Atlas Configuration** (`wpe.json`):
   ```json
   {
     "name": "wpengine-mcp-server",
     "region": "us-east-1",
     "environments": {
       "production": {
         "wp_schema_version": "latest",
         "php_version": "8.2",
         "node_version": "18"
       }
     },
     "build": {
       "command": "npm run atlas:build"
     },
     "start": {
       "command": "npm run atlas:start"
     }
   }
   ```

4. **Set Environment Variables** in Atlas Dashboard:
   ```bash
   # In Atlas environment settings, add:
   WPENGINE_API_TOKEN=your-actual-api-token
   WPENGINE_API_BASE_URL=https://api.wpengineapi.com/v1
   WPENGINE_REQUEST_TIMEOUT=30000
   ```

5. **Deploy to Atlas**:
   ```bash
   # Initialize Atlas project
   atlas init
   
   # Deploy to Atlas
   atlas deploy
   ```

#### Atlas Configuration Options

- **Memory**: 512MB - 2GB (recommended: 1GB)
- **CPU**: 0.5 - 2 vCPU (recommended: 1 vCPU)
- **Auto-scaling**: Enable for production loads
- **Health checks**: Configure HTTP health check on `/health` endpoint

#### Production Considerations

- **Environment Variables**: Use Atlas secrets management for API tokens
- **Monitoring**: Enable Atlas monitoring and logging
- **SSL/TLS**: Atlas provides automatic SSL certificates
- **Load Balancing**: Configure Atlas load balancer for high availability
- **Backup**: Regular backups of Atlas configuration and environment

### Remote MCP Server Configuration

When deployed on Atlas, configure as a remote MCP server:

```json
{
  "mcpServers": {
    "wpengine-mcp-server": {
      "url": "https://your-atlas-app.wpengine.com/mcp",
      "headers": {
        "Authorization": "Bearer your-mcp-server-token"
      },
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

## Usage

Once configured, you can use the following tools through Claude:

### List Sites
```
"List all my WP Engine sites"
```

### Get Site Information
```
"Get information about site with ID abc123"
```

### Create Site
```
"Create a new WP Engine site called 'my-blog' with PHP 8.2"
```

### Update Site
```
"Update site abc123 to use PHP 8.1"
```

### Delete Site
```
"Delete site with ID abc123"
```

## Tool Schemas

### list_sites
- **Parameters**: None
- **Returns**: Array of site objects with basic information

### get_site_info
- **Parameters**: 
  - `site_id` (string, required) - Site ID
- **Returns**: Complete site details

### create_site
- **Parameters**:
  - `name` (string, required) - Site name
  - `environment` (string, optional) - Environment type (production, staging, development)
  - `php_version` (string, optional) - PHP version
  - `wp_version` (string, optional) - WordPress version
- **Returns**: New site details

### update_site
- **Parameters**:
  - `site_id` (string, required) - Site ID
  - `name` (string, optional) - New site name
  - `php_version` (string, optional) - New PHP version
  - `wp_version` (string, optional) - New WordPress version
  - `backup_enabled` (boolean, optional) - Enable/disable backups
  - `cdn_enabled` (boolean, optional) - Enable/disable CDN
  - `ssl_enabled` (boolean, optional) - Enable/disable SSL
- **Returns**: Updated site information

### delete_site
- **Parameters**:
  - `site_id` (string, required) - Site ID
- **Returns**: Confirmation message

## Error Handling

The server includes comprehensive error handling:

- **Authentication errors** - Invalid API token
- **Authorization errors** - Insufficient permissions
- **Rate limiting** - API rate limit exceeded
- **Validation errors** - Invalid input parameters
- **Network errors** - Connection issues
- **API errors** - WP Engine API specific errors

## Development

### Project Structure
```
wpengine-mcp-server/
├── src/
│   ├── index.ts           # Main server implementation
│   ├── types/             # TypeScript type definitions
│   │   └── wpengine.ts
│   ├── services/          # API service layer
│   │   └── wpengine-api.ts
│   └── utils/             # Utility functions
│       └── validation.ts
├── build/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands
```bash
# Build the server
npm run build

# Watch for changes during development
npm run watch

# Run the server directly (for testing)
node build/index.js
```

## Troubleshooting

1. **Server not starting**: Check that your API token is valid and properly configured
2. **API errors**: Ensure your WP Engine account has API access enabled
3. **Permission errors**: Verify your API token has the necessary permissions
4. **Network issues**: Check your internet connection and firewall settings

## Security

- API tokens are passed via environment variables
- All API communications use HTTPS
- Input validation prevents malicious data
- Error messages don't expose sensitive information

## Support

For issues related to:
- **MCP Server functionality**: Check the server logs and configuration
- **WP Engine API**: Consult WP Engine documentation and support
- **Claude Desktop**: Refer to Anthropic's documentation

---

**Version**: 0.1.0
**Author**: Generated by Claude
**License**: MIT
