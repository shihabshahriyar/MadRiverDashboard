import mongoose from "mongoose"

const token_schema = new mongoose.Schema({
    token : {
        type: String,
        required: true,
    }
}, { timestamps: true });


export default mongoose.model('Token', token_schema);