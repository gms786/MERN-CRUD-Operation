const db = require('../services/db');


const read = async (req, res, Schema) => {
    try {
        const dbRes = await db.readRecord(Schema);
        res.status(200).json(dbRes);
    }catch(err) {
        res.status(404).json({
            message: 'Unable to get data !',
            error: err
        })
    }
}

const create = async (req, res, Schema) => {
    try {
        const data = req.body;
        const dbRes = await db.createRecord(data, Schema);
        res.status(200).json({
            message: 'Record Created Successfully !',
            data: dbRes
        });
    }catch(err) {
        res.status(404).json({
            message: 'Unable to create data !',
            error: err
        })
    }
}

const update = async (req, res, Schema) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const dbRes = await db.updateRecord(id, data, Schema);
        res.status(200).json({
            message: 'Record Updated Successfully !',
            data: dbRes
        });
    }catch(err) {
        res.status(424).json({
            message: 'Unable to update data !',
            error: err
        })
    }
}

const remove = async (req, res, Schema) => {
    try {
        const id = req.params.id;
        const dbRes = await db.deleteRecord(id, Schema);
        res.status(200).json({
            message: 'Record Deleted Successfully !',
            data: dbRes
        });
    }catch(err) {
        console.log(err);
        res.status(424).json({
            message: 'Unable to Delete data !',
            error: err
        })
    }
}

module.exports = {
    read,
    create,
    update,
    remove
}