const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const FigmaAPI = require('figma-api');
require('dotenv').config();

class FigmaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'figma-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.figma = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_figma_file',
            description: 'Get Figma file data by file key',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: {
                  type: 'string',
                  description: 'The Figma file key',
                },
              },
              required: ['fileKey'],
            },
          },
          {
            name: 'get_figma_node',
            description: 'Get specific node data from Figma file',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: {
                  type: 'string',
                  description: 'The Figma file key',
                },
                nodeId: {
                  type: 'string',
                  description: 'The node ID to retrieve',
                },
              },
              required: ['fileKey', 'nodeId'],
            },
          },
          {
            name: 'search_figma_nodes',
            description: 'Search for nodes in Figma file by name or type',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: {
                  type: 'string',
                  description: 'The Figma file key',
                },
                query: {
                  type: 'string',
                  description: 'Search query for node name or type',
                },
              },
              required: ['fileKey', 'query'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Initialize Figma API if not already done
        if (!this.figma) {
          const accessToken = process.env.FIGMA_ACCESS_TOKEN;
          if (!accessToken) {
            throw new Error('FIGMA_ACCESS_TOKEN environment variable is required');
          }
          this.figma = new FigmaAPI({ personalAccessToken: accessToken });
        }

        switch (name) {
          case 'get_figma_file':
            return await this.getFigmaFile(args.fileKey);
          
          case 'get_figma_node':
            return await this.getFigmaNode(args.fileKey, args.nodeId);
          
          case 'search_figma_nodes':
            return await this.searchFigmaNodes(args.fileKey, args.query);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async getFigmaFile(fileKey) {
    const file = await this.figma.getFile(fileKey);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(file, null, 2),
        },
      ],
    };
  }

  async getFigmaNode(fileKey, nodeId) {
    const file = await this.figma.getFile(fileKey);
    const node = this.findNodeById(file.document, nodeId);
    
    if (!node) {
      throw new Error(`Node with ID ${nodeId} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(node, null, 2),
        },
      ],
    };
  }

  async searchFigmaNodes(fileKey, query) {
    const file = await this.figma.getFile(fileKey);
    const matchingNodes = this.searchNodes(file.document, query);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(matchingNodes, null, 2),
        },
      ],
    };
  }

  findNodeById(node, nodeId) {
    if (node.id === nodeId) {
      return node;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, nodeId);
        if (found) return found;
      }
    }
    
    return null;
  }

  searchNodes(node, query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    const matches = (node.name && node.name.toLowerCase().includes(queryLower)) ||
                   (node.type && node.type.toLowerCase().includes(queryLower));
    
    if (matches) {
      results.push({
        id: node.id,
        name: node.name,
        type: node.type,
        absoluteBoundingBox: node.absoluteBoundingBox,
      });
    }
    
    if (node.children) {
      for (const child of node.children) {
        results.push(...this.searchNodes(child, query));
      }
    }
    
    return results;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Figma MCP Server running on stdio');
  }
}

// Start the server
const server = new FigmaMCPServer();
server.run().catch(console.error);

