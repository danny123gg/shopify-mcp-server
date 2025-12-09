import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// Shopify API 配置
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'happier-shopping-3.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// JSON-RPC 2.0 错误处理
function createError(code, message, data = null) {
  return {
    code,
    message,
    data
  };
}

// 调用 Shopify Admin API
async function callShopifyAPI(endpoint, method = 'GET', body = null) {
  const url = `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
  };

  const options = {
    method,
    headers
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// MCP 工具列表
const tools = [
  {
    name: "get_products",
    description: "获取 Shopify 店铺中的商品列表。可以按标题、标签、供应商等条件筛选。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的商品数量限制，默认 10，最大 250",
          default: 10
        },
        title: {
          type: "string",
          description: "按商品标题搜索"
        },
        vendor: {
          type: "string",
          description: "按供应商筛选"
        },
        product_type: {
          type: "string",
          description: "按商品类型筛选"
        },
        tags: {
          type: "string",
          description: "按标签筛选，多个标签用逗号分隔"
        }
      }
    }
  },
  {
    name: "get_product_by_id",
    description: "根据商品 ID 获取单个商品的详细信息",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Shopify 商品 ID"
        }
      },
      required: ["product_id"]
    }
  },
  {
    name: "search_products",
    description: "搜索商品，支持关键词搜索",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索关键词"
        },
        limit: {
          type: "number",
          description: "返回结果数量，默认 10",
          default: 10
        }
      },
      required: ["query"]
    }
  }
];

// JSON-RPC 处理器
async function handleJsonRpc(req, res) {
  const { jsonrpc, method, id, params } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({
      jsonrpc: '2.0',
      error: createError(-32600, 'Invalid Request'),
      id: id || null
    });
  }

  // 处理通知（没有 id 字段的请求）
  const isNotification = id === undefined || id === null;

  try {
    let result;

    switch (method) {
      case 'initialize':
        // MCP 初始化方法
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'shopify-mcp-server',
            version: '1.0.0'
          }
        };
        break;

      case 'notifications/initialized':
        // MCP 初始化通知，不需要响应（通知永远不应该有响应）
        return res.status(200).end();

      case 'tools/list':
        result = { tools };
        break;

      case 'tools/call':
        if (!params || !params.name) {
          throw new Error('Tool name is required');
        }
        result = await handleToolCall(params.name, params.arguments || {});
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    // 如果是通知，不返回响应体
    if (isNotification) {
      return res.status(200).end();
    }

    // 返回 JSON-RPC 响应
    res.json({
      jsonrpc: '2.0',
      result,
      id
    });
  } catch (error) {
    console.error('Error handling request:', error);
    
    // 如果是通知出错，不返回错误响应
    if (isNotification) {
      return res.status(200).end();
    }

    res.json({
      jsonrpc: '2.0',
      error: createError(-32603, 'Internal error', error.message),
      id: id || null
    });
  }
}

// 工具调用处理
async function handleToolCall(toolName, args) {
  if (!SHOPIFY_ACCESS_TOKEN) {
    throw new Error('Shopify access token is not configured');
  }

  switch (toolName) {
    case 'get_products':
      return await getProducts(args);
    
    case 'get_product_by_id':
      return await getProductById(args.product_id);
    
    case 'search_products':
      return await searchProducts(args.query, args.limit || 10);
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// 获取商品列表
async function getProducts(args) {
  const { limit = 10, title, vendor, product_type, tags } = args;
  
  let endpoint = `products.json?limit=${Math.min(limit, 250)}`;
  
  if (title) {
    endpoint += `&title=${encodeURIComponent(title)}`;
  }
  if (vendor) {
    endpoint += `&vendor=${encodeURIComponent(vendor)}`;
  }
  if (product_type) {
    endpoint += `&product_type=${encodeURIComponent(product_type)}`;
  }
  if (tags) {
    endpoint += `&tags=${encodeURIComponent(tags)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.products || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取商品
async function getProductById(productId) {
  const data = await callShopifyAPI(`products/${productId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.product || {}, null, 2)
      }
    ]
  };
}

// 搜索商品
async function searchProducts(query, limit = 10) {
  // Shopify 使用 GraphQL 进行搜索更强大，这里使用 REST API 的简化版本
  const data = await callShopifyAPI(`products.json?limit=${Math.min(limit, 250)}`);
  const products = data.products || [];
  
  // 简单的关键词匹配
  const queryLower = query.toLowerCase();
  const filtered = products.filter(product => 
    product.title?.toLowerCase().includes(queryLower) ||
    product.body_html?.toLowerCase().includes(queryLower) ||
    product.tags?.toLowerCase().includes(queryLower)
  );

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(filtered, null, 2)
      }
    ]
  };
}

// 路由
app.post('/', handleJsonRpc);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'shopify-mcp-server',
    store: SHOPIFY_STORE,
    token_configured: !!SHOPIFY_ACCESS_TOKEN
  });
});

// 导出给 Vercel 使用
export default app;

// 本地开发时启动服务器
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Shopify MCP Server running on port ${PORT}`);
    console.log(`Store: ${SHOPIFY_STORE}`);
    console.log(`Access Token: ${SHOPIFY_ACCESS_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  });
}

