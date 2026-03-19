const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: [50, 'Company name cannot exceed 50 characters'],
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    status: {
        type: String,
        required: true,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);