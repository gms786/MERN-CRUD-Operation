import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ silent: true }); // quiet mode is silent in dotenv ESM

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI.replace('<DB_PASSWORD>', process.env.MONGODB_PASSWORD)
)
.then(() => console.log('Connected to Database'))
.catch(err => console.error('Error connecting to Database', err));

/**
 * CRUD Utility Functions
 */
export const readRecord = async (schema) => {
  const dbRes = await schema.find().sort({ _id: -1 });
  return dbRes;
};

export const createRecord = async (data, schema) => {
  const dbRes = await new schema(data).save();
  return dbRes;
};

export const updateRecord = async (id, data, schema) => {
  const dbRes = await schema.findByIdAndUpdate(id, data, { new: true });
  return dbRes;
};

export const deleteRecord = async (id, schema) => {
  const dbRes = await schema.findByIdAndDelete(id);
  return dbRes;
};