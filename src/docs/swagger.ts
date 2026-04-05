const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Zorvyn Finance Backend API',
    version: '2.0.0',
    description: 'Typed Express backend with authentication, role-aware access control, and financial analytics.',
  },
  servers: [
    {
      url: '/api',
      description: 'Current API server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Permission denied' },
          code: { type: 'string', example: 'PERMISSION_DENIED' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', example: 'newuser' },
          email: { type: 'string', format: 'email', example: 'newuser@example.com' },
          password: { type: 'string', example: 'CaseStudy123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', example: 'admin@finance.local' },
          role: { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUser' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      RecordRequest: {
        type: 'object',
        required: ['amount', 'type', 'category'],
        properties: {
          amount: { type: 'number', example: 2500.75 },
          type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
          category: { type: 'string', example: 'Salary' },
          description: { type: 'string', example: 'Monthly salary payment' },
          date: { type: 'string', format: 'date-time', example: '2026-04-05T10:00:00.000Z' },
          currency: { type: 'string', example: 'USD' },
        },
      },
      RecordResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          user_id: { type: 'integer', example: 1 },
          amount: { type: 'number', example: 2500.75 },
          type: { type: 'string', enum: ['income', 'expense'] },
          category: { type: 'string', example: 'Salary' },
          description: { type: 'string', nullable: true, example: 'Monthly salary payment' },
          date: { type: 'string', format: 'date-time' },
          currency: { type: 'string', example: 'USD' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedRecordsResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/RecordResponse' },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 42 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
      RecordSummaryItem: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['income', 'expense'] },
          count: { type: 'string', example: '4' },
          total: { type: 'string', example: '5200.00' },
        },
      },
      UserUpdateRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'updateduser' },
          email: { type: 'string', format: 'email', example: 'updated@example.com' },
          role: { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        },
      },
      AssignRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
        },
      },
      ChangeStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        },
      },
      CategoryTotal: {
        type: 'object',
        properties: {
          category: { type: 'string', example: 'Salary' },
          type: { type: 'string', enum: ['income', 'expense'] },
          total: { type: 'number', example: 8000 },
        },
      },
      MonthlyTrend: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '2026-04' },
          type: { type: 'string', enum: ['income', 'expense'] },
          total: { type: 'number', example: 3400 },
        },
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totalIncome: { type: 'number', example: 10000 },
          totalExpenses: { type: 'number', example: 2500 },
          netBalance: { type: 'number', example: 7500 },
          categoryTotals: {
            type: 'array',
            items: { $ref: '#/components/schemas/CategoryTotal' },
          },
          recentActivity: {
            type: 'array',
            items: { $ref: '#/components/schemas/RecordResponse' },
          },
        },
      },
      AdminDashboardItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', example: 'admin@finance.local' },
          role: { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
          record_count: { type: 'number', example: 12 },
          total_income: { type: 'number', example: 14000 },
          total_expenses: { type: 'number', example: 3200 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Records' },
    { name: 'Analytics' },
    { name: 'Health' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '409': {
            description: 'User already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        responses: {
          '200': {
            description: 'Authenticated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/AuthUser' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Admin only.',
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AuthUser' },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID',
        description: 'Accessible to admins and to the authenticated user requesting their own profile.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthUser' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user',
        description: 'Admin only.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdateRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthUser' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user',
        description: 'Admin only.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'User deleted',
          },
        },
      },
    },
    '/users/{id}/assign-role': {
      post: {
        tags: ['Users'],
        summary: 'Assign a role to a user',
        description: 'Admin only.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignRoleRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Role assigned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthUser' },
              },
            },
          },
        },
      },
    },
    '/users/{id}/change-status': {
      post: {
        tags: ['Users'],
        summary: 'Change a user status',
        description: 'Admin only.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangeStatusRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status changed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthUser' },
              },
            },
          },
        },
      },
    },
    '/records': {
      get: {
        tags: ['Records'],
        summary: 'Get current user records',
        description: 'Accessible to analysts and admins under the current role model.',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Search category or description' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of records',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedRecordsResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Records'],
        summary: 'Create a financial record',
        description: 'Accessible to analysts and admins under the current role model.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecordRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Record created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecordResponse' },
              },
            },
          },
        },
      },
    },
    '/records/summary': {
      get: {
        tags: ['Records'],
        summary: 'Get summary totals for current user',
        description: 'Accessible to analysts and admins under the current role model.',
        responses: {
          '200': {
            description: 'Record summary',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RecordSummaryItem' },
                },
              },
            },
          },
        },
      },
    },
    '/records/admin/all': {
      get: {
        tags: ['Records'],
        summary: 'Get all records as admin',
        description: 'Admin only.',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'integer' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Search category or description' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Paginated records for admin review',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedRecordsResponse' },
              },
            },
          },
        },
      },
    },
    '/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get a record by ID',
        description: 'Accessible to analysts and admins under the current role model.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Record found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecordResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Records'],
        summary: 'Update a record',
        description: 'Admins can update any record. Analysts can update their own records.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 1800 },
                  type: { type: 'string', enum: ['income', 'expense'] },
                  category: { type: 'string', example: 'Freelance' },
                  description: { type: 'string', example: 'Updated description' },
                  date: { type: 'string', format: 'date-time' },
                  currency: { type: 'string', example: 'USD' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Record updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecordResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Records'],
        summary: 'Soft-delete a record',
        description: 'Admins can delete any record. Analysts can delete their own records. Soft delete keeps history out of normal queries.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Record soft-deleted',
          },
        },
      },
    },
    '/analytics/summary': {
      get: {
        tags: ['Analytics'],
        summary: 'Get dashboard summary for current user',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Dashboard summary',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardSummary' },
              },
            },
          },
        },
      },
    },
    '/analytics/income': {
      get: {
        tags: ['Analytics'],
        summary: 'Get total income',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Total income',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalIncome: { type: 'number', example: 10000 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/expenses': {
      get: {
        tags: ['Analytics'],
        summary: 'Get total expenses',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Total expenses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalExpenses: { type: 'number', example: 3200 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/balance': {
      get: {
        tags: ['Analytics'],
        summary: 'Get net balance',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Net balance',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    netBalance: { type: 'number', example: 6800 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/categories': {
      get: {
        tags: ['Analytics'],
        summary: 'Get category totals',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Category totals',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CategoryTotal' },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/recent': {
      get: {
        tags: ['Analytics'],
        summary: 'Get recent activity',
        description: 'Accessible to all authenticated roles, including viewers.',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': {
            description: 'Recent activity',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RecordResponse' },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/trends': {
      get: {
        tags: ['Analytics'],
        summary: 'Get monthly trends',
        description: 'Accessible to all authenticated roles, including viewers.',
        responses: {
          '200': {
            description: 'Monthly trends',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MonthlyTrend' },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/admin/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Get admin dashboard',
        description: 'Admin only.',
        responses: {
          '200': {
            description: 'Admin dashboard',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AdminDashboardItem' },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        security: [],
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'production' },
                    services: {
                      type: 'object',
                      properties: {
                        database: { type: 'string', example: 'up' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default swaggerDocument;
