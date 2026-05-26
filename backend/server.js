import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();

app.use(cors({
    origin: "https://yourname-bfhl-herokuapp-com-bfhl.onrender.com",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],
    credentials: true
}))
app.use(express.json());

app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // Check if the URI contains the placeholder, meaning we don't have the real password.
    // In that case, use an in-memory server for testing.
    if (!mongoUri || mongoUri.includes('<db_password>')) {
      console.log('Using in-memory MongoDB for testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

startServer();
