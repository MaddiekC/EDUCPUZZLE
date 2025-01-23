// server/config/database.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carga las variables de entorno desde un archivo .env
dotenv.config();

const connectDB = async () => {
  try {
    // Obtiene la URI de conexión desde las variables de entorno
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Conecta a la base de datos
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Database connected successfully');
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1); // Detiene el servidor si no puede conectarse a la base de datos
  }
};

export default connectDB;
