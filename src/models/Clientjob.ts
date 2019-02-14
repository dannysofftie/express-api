import { Schema, model } from 'mongoose';

const job = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    client: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    cover: {
        file: {
            type: String,
        },
        path: {
            type: String,
        },
        key: {
            type: String,
        },
    },
    attachments: [
        {
            path: { type: String },
            file: { type: String },
            key: { type: String },
            mime: { type: String, enum: ['image', 'video', 'document'] },
        },
    ],
    bids: [
        {
            bidder: { type: Schema.Types.ObjectId },
            amount: { type: Number || String },
            deliverytime: String,
            deliveryperiod: String,
            approved: { type: Boolean, default: false },
            biddate: { type: Date, default: Date.now },
        },
    ],
    location: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'complete', 'conflict'],
        default: 'pending',
    },
    budget: {
        min: {
            type: Number,
        },
        max: {
            type: Number,
        },
    },
    tags: {
        type: String,
    },
    urgency: {
        type: String,
    },
    paymentform: {
        type: String,
    },
    slug: {
        type: String,
    },
    views: {
        type: Number,
        default: 0,
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

job.pre('save', function(next, docs) {
    const title = this['title'] as string;
    this['slug'] = title
        .split(' ')
        .join('-')
        .toLowerCase();
    next();
});

export default model('Clientjobs', job);
