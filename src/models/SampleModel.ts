import { Schema, model } from 'mongoose';

const samplecollection = new Schema({
    title: {
        type: String,
        required: true,
    },
    createdat: {
        type: Date,
        default: Date.now,
    },
    updatedat: {
        type: Date,
        default: Date.now,
    },
});

export default model('samplecollections', samplecollection);
