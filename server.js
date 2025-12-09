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
  },
  {
    name: "search_shop_policies_and_faqs",
    description: "搜索 Shopify 店铺的政策和常见问题解答（FAQ）。可以查询退款政策、隐私政策、服务条款、配送政策等。",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索关键词，用于在政策和FAQ中搜索相关内容"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_cart",
    description: "获取购物车信息。需要提供购物车ID。",
    inputSchema: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description: "购物车ID"
        }
      },
      required: ["cart_id"]
    }
  },
  {
    name: "update_cart",
    description: "更新购物车，可以添加、更新或删除购物车中的商品。",
    inputSchema: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description: "购物车ID"
        },
        lines: {
          type: "array",
          description: "购物车商品列表，每个商品包含 merchandiseId 和 quantity",
          items: {
            type: "object",
            properties: {
              merchandiseId: {
                type: "string",
                description: "商品变体ID"
              },
              quantity: {
                type: "number",
                description: "商品数量"
              }
            }
          }
        }
      },
      required: ["cart_id", "lines"]
    }
  },
  {
    name: "get_collections",
    description: "获取 Shopify 店铺中的产品集合（分类）列表。可以按标题、句柄等条件筛选。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的集合数量限制，默认 10，最大 250",
          default: 10
        },
        title: {
          type: "string",
          description: "按集合标题搜索"
        }
      }
    }
  },
  {
    name: "get_collection_by_id",
    description: "根据集合 ID 获取单个集合的详细信息，包括集合中的产品列表",
    inputSchema: {
      type: "object",
      properties: {
        collection_id: {
          type: "string",
          description: "Shopify 集合 ID"
        }
      },
      required: ["collection_id"]
    }
  },
  {
    name: "get_orders",
    description: "获取 Shopify 店铺中的订单列表。可以按状态、创建时间等条件筛选。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的订单数量限制，默认 10，最大 250",
          default: 10
        },
        status: {
          type: "string",
          description: "按订单状态筛选，可选值：open, closed, cancelled, any",
          enum: ["open", "closed", "cancelled", "any"]
        },
        financial_status: {
          type: "string",
          description: "按财务状态筛选，可选值：authorized, pending, paid, partially_paid, refunded, voided, partially_refunded, unpaid"
        }
      }
    }
  },
  {
    name: "get_order_by_id",
    description: "根据订单 ID 获取单个订单的详细信息，包括订单项、客户信息、配送信息等",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        }
      },
      required: ["order_id"]
    }
  },
  {
    name: "get_customers",
    description: "获取 Shopify 店铺中的客户列表。可以按邮箱、姓名等条件搜索。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的客户数量限制，默认 10，最大 250",
          default: 10
        },
        email: {
          type: "string",
          description: "按邮箱搜索客户"
        },
        query: {
          type: "string",
          description: "搜索关键词，用于搜索客户姓名、邮箱等"
        }
      }
    }
  },
  {
    name: "get_customer_by_id",
    description: "根据客户 ID 获取单个客户的详细信息，包括订单历史、地址等",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "Shopify 客户 ID"
        }
      },
      required: ["customer_id"]
    }
  },
  {
    name: "get_shop_info",
    description: "获取 Shopify 店铺的基本信息，包括店铺名称、域名、货币、时区等",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_inventory_items",
    description: "获取 Shopify 店铺中的库存项目列表。库存项目代表一个可追踪库存的商品变体。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的库存项目数量限制，默认 10，最大 250",
          default: 10
        },
        ids: {
          type: "string",
          description: "按库存项目ID筛选，多个ID用逗号分隔"
        }
      }
    }
  },
  {
    name: "get_inventory_item_by_id",
    description: "根据库存项目 ID 获取单个库存项目的详细信息",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_id: {
          type: "string",
          description: "Shopify 库存项目 ID"
        }
      },
      required: ["inventory_item_id"]
    }
  },
  {
    name: "get_locations",
    description: "获取 Shopify 店铺中的库存位置列表。库存位置代表商品存储的物理位置（如仓库、商店等）。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的位置数量限制，默认 10，最大 250",
          default: 10
        }
      }
    }
  },
  {
    name: "get_inventory_levels",
    description: "获取库存水平信息。需要提供位置ID和库存项目ID，或仅提供其中一个进行筛选。",
    inputSchema: {
      type: "object",
      properties: {
        location_ids: {
          type: "string",
          description: "位置ID，多个ID用逗号分隔"
        },
        inventory_item_ids: {
          type: "string",
          description: "库存项目ID，多个ID用逗号分隔"
        }
      }
    }
  },
  {
    name: "get_product_variants",
    description: "获取指定商品的所有变体信息，包括每个变体的库存数量",
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
    name: "get_fulfillments",
    description: "获取订单的发货履约信息。可以查看订单的发货状态、物流跟踪号等。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        }
      },
      required: ["order_id"]
    }
  },
  {
    name: "create_fulfillment",
    description: "为订单创建发货履约。需要提供订单ID、位置ID和要发货的商品列表。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        },
        location_id: {
          type: "string",
          description: "发货位置 ID"
        },
        tracking_number: {
          type: "string",
          description: "物流跟踪号（可选）"
        },
        tracking_company: {
          type: "string",
          description: "物流公司名称（可选）"
        },
        notify_customer: {
          type: "boolean",
          description: "是否通知客户，默认 true",
          default: true
        }
      },
      required: ["order_id", "location_id"]
    }
  },
  {
    name: "get_refunds",
    description: "获取订单的退款信息。可以查看订单的所有退款记录。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        }
      },
      required: ["order_id"]
    }
  },
  {
    name: "create_refund",
    description: "为订单创建退款。可以部分退款或全额退款。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        },
        amount: {
          type: "string",
          description: "退款金额（可选，不提供则全额退款）"
        },
        currency: {
          type: "string",
          description: "货币代码，默认使用订单货币"
        },
        reason: {
          type: "string",
          description: "退款原因（可选）"
        },
        note: {
          type: "string",
          description: "退款备注（可选）"
        }
      },
      required: ["order_id"]
    }
  },
  {
    name: "cancel_order",
    description: "取消订单。可以取消未发货的订单。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID"
        },
        reason: {
          type: "string",
          description: "取消原因（可选）"
        },
        email: {
          type: "boolean",
          description: "是否发送取消邮件给客户，默认 false",
          default: false
        }
      },
      required: ["order_id"]
    }
  },
  {
    name: "get_customer_metafields",
    description: "获取客户的自定义元数据字段。用于查看客户画像、标签等扩展信息。",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "Shopify 客户 ID"
        }
      },
      required: ["customer_id"]
    }
  },
  {
    name: "get_product_metafields",
    description: "获取商品的自定义元数据字段。用于查看商品的扩展信息、自定义属性等。",
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
    name: "get_draft_orders",
    description: "获取草稿订单列表。草稿订单是尚未完成的订单，可以后续完成或删除。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的草稿订单数量限制，默认 10，最大 250",
          default: 10
        },
        status: {
          type: "string",
          description: "按状态筛选，可选值：open, invoice_sent, completed",
          enum: ["open", "invoice_sent", "completed"]
        }
      }
    }
  },
  {
    name: "get_draft_order_by_id",
    description: "根据草稿订单 ID 获取单个草稿订单的详细信息",
    inputSchema: {
      type: "object",
      properties: {
        draft_order_id: {
          type: "string",
          description: "Shopify 草稿订单 ID"
        }
      },
      required: ["draft_order_id"]
    }
  },
  {
    name: "get_price_rules",
    description: "获取价格规则列表。价格规则用于创建折扣、促销活动等。",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "返回的价格规则数量限制，默认 10，最大 250",
          default: 10
        },
        status: {
          type: "string",
          description: "按状态筛选，可选值：active, expired",
          enum: ["active", "expired"]
        }
      }
    }
  },
  {
    name: "get_discount_codes",
    description: "获取折扣码列表。可以查看所有可用的折扣码及其使用情况。",
    inputSchema: {
      type: "object",
      properties: {
        price_rule_id: {
          type: "string",
          description: "价格规则 ID（可选，用于筛选特定价格规则的折扣码）"
        },
        limit: {
          type: "number",
          description: "返回的折扣码数量限制，默认 10，最大 250",
          default: 10
        }
      }
    }
  },
  {
    name: "get_returns",
    description: "获取退货信息。可以查看订单的退货申请和处理状态。",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Shopify 订单 ID（可选）"
        },
        limit: {
          type: "number",
          description: "返回的退货数量限制，默认 10，最大 250",
          default: 10
        }
      }
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
        // 返回 204 No Content，符合 HTTP 规范
        return res.status(204).end();

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
      // 返回 204 No Content，符合 HTTP 规范
      return res.status(204).end();
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
      // 返回 204 No Content，符合 HTTP 规范
      return res.status(204).end();
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
    
    case 'search_shop_policies_and_faqs':
      return await searchPoliciesAndFAQs(args.query);
    
    case 'get_cart':
      return await getCart(args.cart_id);
    
    case 'update_cart':
      return await updateCart(args.cart_id, args.lines);
    
    case 'get_collections':
      return await getCollections(args);
    
    case 'get_collection_by_id':
      return await getCollectionById(args.collection_id);
    
    case 'get_orders':
      return await getOrders(args);
    
    case 'get_order_by_id':
      return await getOrderById(args.order_id);
    
    case 'get_customers':
      return await getCustomers(args);
    
    case 'get_customer_by_id':
      return await getCustomerById(args.customer_id);
    
    case 'get_shop_info':
      return await getShopInfo();
    
    case 'get_inventory_items':
      return await getInventoryItems(args);
    
    case 'get_inventory_item_by_id':
      return await getInventoryItemById(args.inventory_item_id);
    
    case 'get_locations':
      return await getLocations(args);
    
    case 'get_inventory_levels':
      return await getInventoryLevels(args);
    
    case 'get_product_variants':
      return await getProductVariants(args.product_id);
    
    case 'get_fulfillments':
      return await getFulfillments(args.order_id);
    
    case 'create_fulfillment':
      return await createFulfillment(args);
    
    case 'get_refunds':
      return await getRefunds(args.order_id);
    
    case 'create_refund':
      return await createRefund(args);
    
    case 'cancel_order':
      return await cancelOrder(args);
    
    case 'get_customer_metafields':
      return await getCustomerMetafields(args.customer_id);
    
    case 'get_product_metafields':
      return await getProductMetafields(args.product_id);
    
    case 'get_draft_orders':
      return await getDraftOrders(args);
    
    case 'get_draft_order_by_id':
      return await getDraftOrderById(args.draft_order_id);
    
    case 'get_price_rules':
      return await getPriceRules(args);
    
    case 'get_discount_codes':
      return await getDiscountCodes(args);
    
    case 'get_returns':
      return await getReturns(args);
    
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

// 搜索政策和FAQ
async function searchPoliciesAndFAQs(query) {
  // 注意：Shopify Admin API 不直接支持政策和FAQ查询
  // 这里使用 Storefront GraphQL API 或返回提示信息
  // 简化版本：返回提示信息，说明需要通过 Storefront API 访问
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          message: "政策和FAQ查询需要通过 Shopify Storefront GraphQL API 访问。",
          note: "此功能需要 Storefront Access Token 和 GraphQL 查询。",
          query: query,
          suggestion: "请使用 Shopify Storefront API 或联系管理员配置 Storefront Access Token"
        }, null, 2)
      }
    ]
  };
}

// 获取购物车
async function getCart(cartId) {
  // 注意：购物车操作通常使用 Storefront API
  // 这里提供一个简化版本
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          message: "购物车查询需要通过 Shopify Storefront API 访问。",
          cart_id: cartId,
          note: "此功能需要 Storefront Access Token 和 GraphQL 查询。",
          suggestion: "请使用 Shopify Storefront API 或联系管理员配置 Storefront Access Token"
        }, null, 2)
      }
    ]
  };
}

// 更新购物车
async function updateCart(cartId, lines) {
  // 注意：购物车操作通常使用 Storefront API
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          message: "购物车更新需要通过 Shopify Storefront API 访问。",
          cart_id: cartId,
          lines: lines,
          note: "此功能需要 Storefront Access Token 和 GraphQL 查询。",
          suggestion: "请使用 Shopify Storefront API 或联系管理员配置 Storefront Access Token"
        }, null, 2)
      }
    ]
  };
}

// 获取集合列表
async function getCollections(args) {
  const { limit = 10, title } = args;
  
  let endpoint = `smart_collections.json?limit=${Math.min(limit, 250)}`;
  
  if (title) {
    endpoint += `&title=${encodeURIComponent(title)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.smart_collections || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取集合
async function getCollectionById(collectionId) {
  const data = await callShopifyAPI(`smart_collections/${collectionId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.smart_collection || {}, null, 2)
      }
    ]
  };
}

// 获取订单列表
async function getOrders(args) {
  const { limit = 10, status, financial_status } = args;
  
  let endpoint = `orders.json?limit=${Math.min(limit, 250)}&status=any`;
  
  if (status) {
    endpoint = endpoint.replace('status=any', `status=${status}`);
  }
  if (financial_status) {
    endpoint += `&financial_status=${encodeURIComponent(financial_status)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.orders || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取订单
async function getOrderById(orderId) {
  const data = await callShopifyAPI(`orders/${orderId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.order || {}, null, 2)
      }
    ]
  };
}

// 获取客户列表
async function getCustomers(args) {
  const { limit = 10, email, query } = args;
  
  let endpoint = `customers.json?limit=${Math.min(limit, 250)}`;
  
  if (email) {
    endpoint += `&email=${encodeURIComponent(email)}`;
  }
  if (query) {
    endpoint += `&query=${encodeURIComponent(query)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.customers || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取客户
async function getCustomerById(customerId) {
  const data = await callShopifyAPI(`customers/${customerId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.customer || {}, null, 2)
      }
    ]
  };
}

// 获取店铺信息
async function getShopInfo() {
  const data = await callShopifyAPI('shop.json');
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.shop || {}, null, 2)
      }
    ]
  };
}

// 获取库存项目列表
async function getInventoryItems(args) {
  const { limit = 10, ids } = args;
  
  let endpoint = `inventory_items.json?limit=${Math.min(limit, 250)}`;
  
  if (ids) {
    endpoint += `&ids=${encodeURIComponent(ids)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.inventory_items || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取库存项目
async function getInventoryItemById(inventoryItemId) {
  const data = await callShopifyAPI(`inventory_items/${inventoryItemId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.inventory_item || {}, null, 2)
      }
    ]
  };
}

// 获取库存位置列表
async function getLocations(args) {
  const { limit = 10 } = args;
  
  const endpoint = `locations.json?limit=${Math.min(limit, 250)}`;
  const data = await callShopifyAPI(endpoint);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.locations || [], null, 2)
      }
    ]
  };
}

// 获取库存水平
async function getInventoryLevels(args) {
  const { location_ids, inventory_item_ids } = args;
  
  let endpoint = 'inventory_levels.json?';
  
  if (location_ids) {
    endpoint += `location_ids=${encodeURIComponent(location_ids)}`;
  }
  if (inventory_item_ids) {
    if (location_ids) {
      endpoint += '&';
    }
    endpoint += `inventory_item_ids=${encodeURIComponent(inventory_item_ids)}`;
  }
  
  // 如果没有提供任何参数，返回所有库存水平（可能需要限制）
  if (!location_ids && !inventory_item_ids) {
    endpoint += 'limit=250';
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.inventory_levels || [], null, 2)
      }
    ]
  };
}

// 获取商品变体（包含库存信息）
async function getProductVariants(productId) {
  const data = await callShopifyAPI(`products/${productId}/variants.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.variants || [], null, 2)
      }
    ]
  };
}

// 获取订单发货履约信息
async function getFulfillments(orderId) {
  const data = await callShopifyAPI(`orders/${orderId}/fulfillments.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.fulfillments || [], null, 2)
      }
    ]
  };
}

// 创建发货履约
async function createFulfillment(args) {
  const { order_id, location_id, tracking_number, tracking_company, notify_customer = true } = args;
  
  // 首先获取订单信息，以获取要发货的商品列表
  const orderData = await callShopifyAPI(`orders/${order_id}.json`);
  const order = orderData.order;
  
  if (!order) {
    throw new Error(`Order ${order_id} not found`);
  }
  
  // 构建发货请求体
  const fulfillmentBody = {
    location_id: location_id,
    notify_customer: notify_customer,
    line_items: order.line_items.map(item => ({
      id: item.id,
      quantity: item.quantity
    }))
  };
  
  if (tracking_number) {
    fulfillmentBody.tracking_number = tracking_number;
  }
  if (tracking_company) {
    fulfillmentBody.tracking_company = tracking_company;
  }
  
  const data = await callShopifyAPI(`orders/${order_id}/fulfillments.json`, 'POST', {
    fulfillment: fulfillmentBody
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.fulfillment || {}, null, 2)
      }
    ]
  };
}

// 获取订单退款信息
async function getRefunds(orderId) {
  const data = await callShopifyAPI(`orders/${orderId}/refunds.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.refunds || [], null, 2)
      }
    ]
  };
}

// 创建退款
async function createRefund(args) {
  const { order_id, amount, currency, reason, note } = args;
  
  // 首先获取订单信息
  const orderData = await callShopifyAPI(`orders/${order_id}.json`);
  const order = orderData.order;
  
  if (!order) {
    throw new Error(`Order ${order_id} not found`);
  }
  
  // 构建退款请求体
  const refundBody = {
    refund: {
      note: note || reason || 'Refund processed',
      notify: true
    }
  };
  
  // 如果指定了金额，创建部分退款
  if (amount) {
    refundBody.refund.amount = amount;
    refundBody.refund.currency = currency || order.currency;
    // 需要指定要退款的商品
    refundBody.refund.refund_line_items = order.line_items.map(item => ({
      line_item_id: item.id,
      quantity: item.quantity
    }));
  }
  // 否则全额退款
  else {
    refundBody.refund.refund_line_items = order.line_items.map(item => ({
      line_item_id: item.id,
      quantity: item.quantity
    }));
  }
  
  const data = await callShopifyAPI(`orders/${order_id}/refunds.json`, 'POST', refundBody);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.refund || {}, null, 2)
      }
    ]
  };
}

// 取消订单
async function cancelOrder(args) {
  const { order_id, reason, email = false } = args;
  
  const cancelBody = {
    order: {
      cancel_reason: reason || 'other'
    }
  };
  
  if (email) {
    cancelBody.order.email = email;
  }
  
  const data = await callShopifyAPI(`orders/${order_id}/cancel.json`, 'POST', cancelBody);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.order || {}, null, 2)
      }
    ]
  };
}

// 获取客户元数据
async function getCustomerMetafields(customerId) {
  const data = await callShopifyAPI(`customers/${customerId}/metafields.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.metafields || [], null, 2)
      }
    ]
  };
}

// 获取商品元数据
async function getProductMetafields(productId) {
  const data = await callShopifyAPI(`products/${productId}/metafields.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.metafields || [], null, 2)
      }
    ]
  };
}

// 获取草稿订单列表
async function getDraftOrders(args) {
  const { limit = 10, status } = args;
  
  let endpoint = `draft_orders.json?limit=${Math.min(limit, 250)}`;
  
  if (status) {
    endpoint += `&status=${encodeURIComponent(status)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.draft_orders || [], null, 2)
      }
    ]
  };
}

// 根据 ID 获取草稿订单
async function getDraftOrderById(draftOrderId) {
  const data = await callShopifyAPI(`draft_orders/${draftOrderId}.json`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.draft_order || {}, null, 2)
      }
    ]
  };
}

// 获取价格规则列表
async function getPriceRules(args) {
  const { limit = 10, status } = args;
  
  let endpoint = `price_rules.json?limit=${Math.min(limit, 250)}`;
  
  if (status) {
    endpoint += `&status=${encodeURIComponent(status)}`;
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.price_rules || [], null, 2)
      }
    ]
  };
}

// 获取折扣码列表
async function getDiscountCodes(args) {
  const { price_rule_id, limit = 10 } = args;
  
  let endpoint;
  
  if (price_rule_id) {
    // 获取特定价格规则的折扣码
    endpoint = `price_rules/${price_rule_id}/discount_codes.json?limit=${Math.min(limit, 250)}`;
  } else {
    // 获取所有折扣码（需要通过价格规则）
    // 注意：Shopify API 不直接提供获取所有折扣码的端点
    // 这里返回提示信息
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: "获取所有折扣码需要先获取价格规则列表，然后遍历每个价格规则的折扣码。",
            suggestion: "请先使用 get_price_rules 获取价格规则，然后使用 price_rule_id 参数调用此工具。"
          }, null, 2)
        }
      ]
    };
  }

  const data = await callShopifyAPI(endpoint);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data.discount_codes || [], null, 2)
      }
    ]
  };
}

// 获取退货信息
async function getReturns(args) {
  const { order_id, limit = 10 } = args;
  
  let endpoint = `returns.json?limit=${Math.min(limit, 250)}`;
  
  if (order_id) {
    endpoint += `&order_id=${encodeURIComponent(order_id)}`;
  }

  try {
    const data = await callShopifyAPI(endpoint);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.returns || [], null, 2)
        }
      ]
    };
  } catch (error) {
    // 如果 API 不支持，返回提示信息
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: "退货信息查询可能不受支持，或需要特定的 API 权限。",
            error: error.message,
            suggestion: "请检查 Shopify API 权限配置，或通过订单信息查看退货状态。"
          }, null, 2)
        }
      ]
    };
  }
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

