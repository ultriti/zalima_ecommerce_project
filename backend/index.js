const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cookieParser = require('cookie-parser');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const morgan = require('morgan');
const vendorRoutes = require('./routes/vendorRoutes');
const supportRoutes = require('./routes/supportRoutes');

const helmet = require('helmet');
const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');
const { sanitizeRequest } = require('./middleware/sanitizeMiddleware');
const { validateResults } = require('./middleware/validationMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware - Add these before other middleware
app.use(helmet()); // Secure HTTP headers
app.use(sanitizeRequest); // Sanitize all requests
app.use(express.static('public'));

// Middleware
// More specific CORS configuration
app.use(cors({
  // origin: process.env.NODE_ENV === 'production' 
  //   ? process.env.FRONTEND_URL 
  //   : 'http://localhost:5173',
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie parser for handling cookies

// Add logging middleware
app.use(morgan('combined'));

// Swagger documentation - Move this here
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Apply stricter rate limiting to authentication routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Remove CSRF protection middleware
// app.use('/api/users', (req, res, next) => {
//   // Exempt authentication routes from CSRF protection
//   if (req.path === '/register' || 
//       // ... other exempted paths
//       req.path === '/csrf-token') {  // Add this line
//     return next();
//   }
//   
//   // Apply CSRF protection to all other user routes
//   csrfProtection(req, res, next);
// });

// Remove CSRF protection from order routes
// app.use('/api/orders', csrfProtection);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID);
});
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendor', vendorRoutes); // Add this line
app.use('/api/support', supportRoutes); // Add this line

// Add this with your other routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Add this with your other route imports
const paymentRoutes = require('./routes/paymentRoutes');

// Add this with your other route uses
app.use('/api/payment', paymentRoutes);

// Remove CSRF error handler
// app.use(handleCsrfError);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});