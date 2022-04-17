import mongoose from "mongoose"

const transaction_schema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
    },
    amount: {
        type: Number, 
        required: true
    },
    memo: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    coinType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }, hash: {
        type: String,
        default: ''
    }
}, { timestamps: true });


export default mongoose.model('Transaction', transaction_schema);