require('dotenv').config();
require('express-async-errors');

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

// Extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');

const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('../openapi.yaml');



app.set('trust proxy', 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cors());


// Simple landing page
app.get('/', (req, res) => {
    res.send('<h1>Jobs API</h1><a href="/api-docs">API Documentation</a>');
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

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
        console.log(error);
    }
};

start();