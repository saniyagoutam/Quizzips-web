//database/conn.js

import mongoose from "mongoose";

const connect = async function(){
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 8080,
            tls: true,
            tlsAllowInvalidCertificates: true,
            retryWrites: true
        };
        
        if (!process.env.ATLAS_URI) {
            throw new Error('MongoDB connection string is missing');
        }
        
        await mongoose.connect(process.env.ATLAS_URI, options);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Database Connection Failed:", error.message);
        throw error;
    }
}

export default connect;