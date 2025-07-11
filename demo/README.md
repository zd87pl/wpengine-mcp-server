# WP Engine Chat Demo

A Next.js chatbot interface for managing WP Engine accounts through natural language commands. This application provides a user-friendly chat interface that translates natural language requests into WP Engine API calls.

## Features

- **Natural Language Interface**: Chat with your WP Engine account using simple English commands
- **Comprehensive API Coverage**: Supports all major WP Engine API operations
- **Real-time Chat**: Interactive chat interface with message history
- **Rich Response Formatting**: Formatted responses with structured data display
- **Error Handling**: Comprehensive error handling with helpful error messages
- **Responsive Design**: Works on desktop and mobile devices
- **Atlas Ready**: Configured for deployment on WP Engine Atlas

## Supported Commands

### Account Management
- `list accounts` - List all accounts
- `get account info [account-id]` - Get account details

### Site Management
- `list sites` - List all sites
- `get site info [site-id]` - Get site details

### Installation Management
- `list installs` - List all installations
- `get install info [install-id]` - Get installation details
- `list domains for installation [install-id]` - List domains for installation

### Backup Operations
- `create backup for installation [install-id]` - Create a backup

### Cache Management
- `purge cache for installation [install-id]` - Purge all cache
- `purge [type] cache for installation [install-id]` - Purge specific cache type (all, object, page, cdn)

### SSH Key Management
- `list ssh keys` - List all SSH keys

### System Status
- `api status` - Check API status
- `current user` - Get current user info

### Help
- `help` - Show all available commands

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wpengine-chat-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   WPENGINE_API_BASE_URL=https://api.wpengineapi.com/v1
   WPENGINE_AUTH_TOKEN_ID=your_token_id
   WPENGINE_AUTH_PASSWORD=your_password
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WPENGINE_API_BASE_URL` | WP Engine API base URL | Yes |
| `WPENGINE_AUTH_TOKEN_ID` | Your WP Engine API token ID | Yes |
| `WPENGINE_AUTH_PASSWORD` | Your WP Engine API password | Yes |

## API Authentication

This application uses HTTP Basic Authentication with the WP Engine API. You'll need:

1. **API Token ID**: Your WP Engine API token ID
2. **API Password**: Your WP Engine API password

These credentials are obtained from your WP Engine account dashboard under API settings.

## Project Structure

```
wpengine-chat-demo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # API endpoint for chat
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main page
│   ├── components/
│   │   └── ChatInterface.tsx        # Main chat component
│   └── types/
│       └── chat.ts                  # TypeScript types
├── public/                          # Static assets
├── wpe.json                         # Atlas deployment config
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

## Key Components

### ChatInterface Component
- Main chat interface with message history
- Handles user input and API responses
- Formats responses for better readability
- Includes loading states and error handling

### API Route Handler
- Processes natural language commands
- Parses user messages into API calls
- Handles WP Engine API authentication
- Returns formatted responses

### Command Parser
- Converts natural language to API commands
- Supports pattern matching for various command types
- Extracts parameters from user messages

## Command Examples

### Basic Commands
```
list sites
list accounts
list installs
api status
current user
help
```

### Commands with Parameters
```
get site info abc123def
get account info xyz789
get install info install-456
list domains for installation install-456
create backup for installation install-456
purge cache for installation install-456
purge object cache for installation install-456
```

## Response Formatting

The application formats API responses for better readability:

- **Lists**: Formatted with bullet points and structured data
- **Details**: Key-value pairs with proper labels
- **Errors**: Clear error messages with context
- **Help**: Comprehensive command reference

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Displays WP Engine API error messages
- **Authentication Errors**: Clear authentication failure messages
- **Network Errors**: Handles network connectivity issues
- **Parse Errors**: Helps with command format issues

## Deployment

### WP Engine Atlas

The application is configured for deployment on WP Engine Atlas:

1. **Push to repository**: Ensure your code is in a Git repository
2. **Configure Atlas**: Set up the application in your Atlas dashboard
3. **Set environment variables**: Configure API credentials in Atlas
4. **Deploy**: Atlas will automatically build and deploy your application

The `wpe.json` file contains the Atlas configuration including:
- Build settings
- Environment variables
- Function configurations
- Caching headers

### Manual Deployment

For other platforms:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Customization

### Adding New Commands
1. Update the `parseUserMessage` function in `route.ts`
2. Add the command handler in `WPEngineApiClient`
3. Update the help text in `generateHelpText`
4. Add response formatting in `ChatInterface.tsx`

### Styling
The application uses Tailwind CSS for styling. Customize the design by modifying:
- `tailwind.config.js` for theme customization
- Component classes for specific styling
- `globals.css` for global styles

### API Integration
The application directly integrates with the WP Engine API. To modify API behavior:
- Update `WPEngineApiClient` class methods
- Modify authentication headers
- Add new endpoints as needed

## Security Considerations

- **Environment Variables**: Never commit API credentials to version control
- **HTTPS**: Always use HTTPS in production
- **Authentication**: API credentials are handled securely on the server side
- **Input Validation**: User inputs are validated before API calls

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials are correct
   - Check environment variables are set properly
   - Ensure API token has necessary permissions

2. **Network Errors**
   - Check internet connectivity
   - Verify API endpoint URLs
   - Check for firewall restrictions

3. **Build Errors**
   - Ensure all dependencies are installed
   - Check TypeScript types are correct
   - Verify file paths and imports

4. **Command Not Recognized**
   - Check command syntax against examples
   - Use the `help` command to see available options
   - Verify parameter formats (IDs, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the WP Engine API documentation
- Submit issues via the repository issue tracker
