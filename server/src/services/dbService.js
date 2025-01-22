import mongoose from 'mongoose';
import { MONGO_URI } from '../config/environment'; // Asegúrate de definir tu URI de MongoDB en el archivo environment.js

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    
  }
};

// Función para encontrar un documento por ID
const findById = async (model, id) => {
  try {
    const result = await model.findById(id);
    if (!result) throw new Error('Document not found');
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Función para encontrar todos los documentos de un modelo
const findAll = async (model) => {
  try {
    return await model.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Función para crear un nuevo documento
const createDocument = async (model, data) => {
  try {
    const newDocument = new model(data);
    return await newDocument.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Función para actualizar un documento
const updateDocument = async (model, id, updateData) => {
  try {
    const updatedDocument = await model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedDocument) throw new Error('Document not found');
    return updatedDocument;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Función para eliminar un documento
const deleteDocument = async (model, id) => {
  try {
    const deletedDocument = await model.findByIdAndDelete(id);
    if (!deletedDocument) throw new Error('Document not found');
    return deletedDocument;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Exportar las funciones
export default {
  connectDB,
  findById,
  findAll,
  createDocument,
  updateDocument,
  deleteDocument,
};
