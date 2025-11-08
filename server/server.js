// server.js

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router/route.js';
import connect from './database/conn.js';

// Load environment variables
dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

app.use('/api', router);

app.get('/', (req, res) => {
    try {
        res.json({ message: "Quizzips API Server is running", version: "2.0" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with proper error handling
const startServer = async () => {
    try {
        if (!process.env.ATLAS_URI) {
            throw new Error("MongoDB connection string is not defined in .env file");
        }
        await connect();
        return app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
            console.log('MongoDB connection successful');
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.error(err);
    process.exit(1);
});

startServer();