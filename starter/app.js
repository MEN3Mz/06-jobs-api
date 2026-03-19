require('dotenv').config();
require('express-async-errors');

// Extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');

// Swagger UI
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path'); // Core module for path resolution

// Load Swagger with an absolute path
let swaggerDocument;
try {
    swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
} catch (error) {
    console.error("Warning: swagger.yaml could not be loaded. Check your YAML syntax.");
}

const express = require('express');
const app = express();

// Database connection
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

// Routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// Error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// 1. Security Middleware (Apply early)
app.set('trust proxy', 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per window
    })
);
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cors());

// 2. Base Route & Documentation
app.get('/', (req, res) => {
    res.send('<h1>Jobs API</h1><a href="/api-docs">Explore the Documentation</a>');
});

if (swaggerDocument) {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
}

// 3. API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// 4. Fallback Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); // Exit process if DB connection fails
    }
};

start();