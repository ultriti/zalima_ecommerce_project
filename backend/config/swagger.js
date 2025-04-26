const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'E-Commerce API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        },
        {
          url: 'https://api.example.com',
          description: 'Production server'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerDocs)
};