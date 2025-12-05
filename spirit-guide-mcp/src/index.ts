#!/usr/bin/env node
/**
 * Spirit Guide MCP Server
 *
 * A Model Context Protocol server for The Digital Exorcist.
 * Provides chat-based statistics and insights about scanned files.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getStatistics, formatSpiritGuideResponse } from './statistics.js';

// Create the MCP server
const server = new Server(
  {
    name: 'spirit-guide',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_exorcist_stats',
        description:
          'Get statistics about scanned files and classifications from The Digital Exorcist. Query information about ghosts (old files), demons (large files), zombies (duplicates), and overall file management statistics.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Natural language query about file statistics (e.g., "How many ghosts have been banished?", "What is the total size of demons?")',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});


// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_exorcist_stats') {
    try {
      const query = (request.params.arguments as { query?: string }).query || '';
      const stats = await getStatistics();
      const response = formatSpiritGuideResponse(stats, query);

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `The spirits are troubled... An error occurred while consulting the ethereal records: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Spirit Guide MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting Spirit Guide:', error);
  process.exit(1);
});
