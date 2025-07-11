'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatResponse } from '@/types/chat';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: 'Welcome to the WP Engine Chat Interface! I can help you manage your WP Engine account through natural language commands. Type "help" to see available commands.',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: formatResponse(data),
        isUser: false,
        timestamp: new Date(),
        data: data.type === 'success' ? data.data : undefined,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (response: ChatResponse): string => {
    switch (response.type) {
      case 'help':
        return response.content || 'No help content available';
      case 'success':
        return formatSuccessResponse(response);
      case 'error':
        return `❌ Error executing command "${response.command}": ${response.error}`;
      default:
        return 'Unknown response type';
    }
  };

  const formatSuccessResponse = (response: ChatResponse): string => {
    if (response.type !== 'success') return '';

    const { command, data } = response;
    
    switch (command) {
      case 'list_sites':
        return formatSitesList(data);
      case 'get_site_info':
        return formatSiteInfo(data);
      case 'list_accounts':
        return formatAccountsList(data);
      case 'get_account':
        return formatAccountInfo(data);
      case 'list_installs':
        return formatInstallsList(data);
      case 'get_install':
        return formatInstallInfo(data);
      case 'list_domains':
        return formatDomainsList(data);
      case 'create_backup':
        return formatBackupResponse(data);
      case 'purge_cache':
        return formatCacheResponse(data);
      case 'list_ssh_keys':
        return formatSshKeysList(data);
      case 'get_api_status':
        return formatApiStatus(data);
      case 'get_current_user':
        return formatCurrentUser(data);
      default:
        return `✅ Command "${command}" executed successfully\n\n${JSON.stringify(data, null, 2)}`;
    }
  };

  const formatSitesList = (data: any): string => {
    if (!data || !Array.isArray(data.results)) {
      return '✅ No sites found';
    }
    
    return `✅ **Sites List (${data.results.length} sites)**\n\n` + 
           data.results.map((site: any) => 
             `• **${site.name}** (${site.id})\n  Environment: ${site.environment}\n  Created: ${new Date(site.created_on).toLocaleDateString()}`
           ).join('\n\n');
  };

  const formatSiteInfo = (data: any): string => {
    if (!data) return '✅ No site information available';
    
    return `✅ **Site Information**\n\n` +
           `**Name:** ${data.name}\n` +
           `**ID:** ${data.id}\n` +
           `**Environment:** ${data.environment}\n` +
           `**Status:** ${data.status}\n` +
           `**Created:** ${new Date(data.created_on).toLocaleDateString()}\n` +
           `**Account:** ${data.account?.name || 'N/A'}`;
  };

  const formatAccountsList = (data: any): string => {
    if (!data || !Array.isArray(data.results)) {
      return '✅ No accounts found';
    }
    
    return `✅ **Accounts List (${data.results.length} accounts)**\n\n` + 
           data.results.map((account: any) => 
             `• **${account.name}** (${account.id})\n  Status: ${account.status}\n  Created: ${new Date(account.created_on).toLocaleDateString()}`
           ).join('\n\n');
  };

  const formatAccountInfo = (data: any): string => {
    if (!data) return '✅ No account information available';
    
    return `✅ **Account Information**\n\n` +
           `**Name:** ${data.name}\n` +
           `**ID:** ${data.id}\n` +
           `**Status:** ${data.status}\n` +
           `**Created:** ${new Date(data.created_on).toLocaleDateString()}\n` +
           `**Sites:** ${data.sites?.length || 0}`;
  };

  const formatInstallsList = (data: any): string => {
    if (!data || !Array.isArray(data.results)) {
      return '✅ No installations found';
    }
    
    return `✅ **Installations List (${data.results.length} installations)**\n\n` + 
           data.results.map((install: any) => 
             `• **${install.name}** (${install.id})\n  Environment: ${install.environment}\n  Status: ${install.status}\n  PHP Version: ${install.php_version || 'N/A'}`
           ).join('\n\n');
  };

  const formatInstallInfo = (data: any): string => {
    if (!data) return '✅ No installation information available';
    
    return `✅ **Installation Information**\n\n` +
           `**Name:** ${data.name}\n` +
           `**ID:** ${data.id}\n` +
           `**Environment:** ${data.environment}\n` +
           `**Status:** ${data.status}\n` +
           `**PHP Version:** ${data.php_version || 'N/A'}\n` +
           `**Created:** ${new Date(data.created_on).toLocaleDateString()}\n` +
           `**Domains:** ${data.domains?.length || 0}`;
  };

  const formatDomainsList = (data: any): string => {
    if (!data || !Array.isArray(data.results)) {
      return '✅ No domains found';
    }
    
    return `✅ **Domains List (${data.results.length} domains)**\n\n` + 
           data.results.map((domain: any) => 
             `• **${domain.name}**\n  Primary: ${domain.primary ? 'Yes' : 'No'}\n  Redirect: ${domain.redirect || 'None'}`
           ).join('\n\n');
  };

  const formatBackupResponse = (data: any): string => {
    return `✅ **Backup Created Successfully**\n\n` +
           `**ID:** ${data.id}\n` +
           `**Status:** ${data.status}\n` +
           `**Created:** ${new Date(data.created_on).toLocaleDateString()}\n` +
           `**Description:** ${data.description || 'N/A'}`;
  };

  const formatCacheResponse = (data: any): string => {
    return `✅ **Cache Purged Successfully**\n\n` +
           `**Status:** ${data.status || 'Completed'}\n` +
           `**Message:** ${data.message || 'Cache purge initiated'}`;
  };

  const formatSshKeysList = (data: any): string => {
    if (!data || !Array.isArray(data.results)) {
      return '✅ No SSH keys found';
    }
    
    return `✅ **SSH Keys List (${data.results.length} keys)**\n\n` + 
           data.results.map((key: any) => 
             `• **${key.name}** (${key.id})\n  Fingerprint: ${key.fingerprint}\n  Created: ${new Date(key.created_on).toLocaleDateString()}`
           ).join('\n\n');
  };

  const formatApiStatus = (data: any): string => {
    return `✅ **API Status**\n\n` +
           `**Status:** ${data.status || 'Unknown'}\n` +
           `**Version:** ${data.version || 'N/A'}\n` +
           `**Timestamp:** ${new Date().toLocaleString()}`;
  };

  const formatCurrentUser = (data: any): string => {
    return `✅ **Current User Information**\n\n` +
           `**Name:** ${data.first_name} ${data.last_name}\n` +
           `**Email:** ${data.email}\n` +
           `**ID:** ${data.id}\n` +
           `**Status:** ${data.status || 'Active'}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">WP Engine Chat Interface</h1>
          <p className="text-gray-600 mt-1">Manage your WP Engine account through natural language commands</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your WP Engine command... (e.g., 'list sites', 'help')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}