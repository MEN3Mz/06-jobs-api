require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
//db

const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
//routes
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// db


// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { connect } = require('mongoose');


// extra packages
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const ratelimiter = require('express-rate-limit')
app.set('trust proxy', 1) // for rate limiter to work behind a proxy like heroku
app.use(ratelimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}))
app.use(express.json());
app.use(helmet())
app.use(xss())
app.use(cors())

// routes
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