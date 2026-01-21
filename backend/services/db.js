const dotenv = require('dotenv');
dotenv.config({ quiet: true });

const mongo = require('mongoose');

mongo.connect(process.env.MONGODB_URI.replace(
        '<DB_PASSWORD>', process.env.MONGODB_PASSWORD
    ))
    .then(() => {
        console.log('Connected to Database');
    })
    .catch((err) => {
        console.error('Error connecting to Database', err);
    });

const readRecord = async (schema) => {
    const dbRes = await schema.find().sort({_id:-1});
    return dbRes;
}

const createRecord = async (data, schema) => {
    const dbRes = await new schema(data).save();
    return dbRes;
}

const updateRecord = async (id, data, schema) => {
    const dbRes = await schema.findByIdAndUpdate(id, data, { new: true });
    return dbRes;
}

const deleteRecord = async (id, schema) => {
    const dbRes = await schema.findByIdAndDelete(id);
    return dbRes;
}

module.exports = {
    readRecord,
    createRecord,
    updateRecord,
    deleteRecord
}