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

1. **Clone/Download the server code** (if not already done):
   ```bash
   cd /Users/0x7d0/Documents/Cline/MCP
   # Server should already be created
   ```

2. **Install dependencies**:
   ```bash
   cd wpengine-mcp-server
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

Replace `your-wpengine-api-token-here` with your actual WP Engine API token:

```json
{
  "mcpServers": {
    "wpengine-mcp-server": {
      "command": "node",
      "args": [
        "/Users/0x7d0/Documents/Cline/MCP/wpengine-mcp-server/build/index.js"
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
