const statusCodes = require('http-status-codes');
const Job = require('../models/Job');
const { BadRequestError, NotFoundError } = require('../errors');
const getAllJobs = async(req, res) => {
    const jobs = await Job.find({ createdBy: req.user.userid }).sort('createdAt');
    res.status(statusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async(req, res) => {
    const { id: jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, createdBy: req.user.userid });
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }
    res.status(statusCodes.OK).json({ job });
};

const createJob = async(req, res) => {

    req.body.createdBy = req.user.userid;
    const job = await Job.create(req.body);


    res.status(statusCodes.CREATED).json({ job });
};
const updateJob = async(req, res) => {
    const { id: jobId } = req.params;
    const { company, position } = req.body;
    if (!company || !position) {
        throw new BadRequestError('Company and position are required');
    }
    const job = await Job.findOneAndUpdate({ _id: jobId, createdBy: req.user.userid }, req.body, { new: true, runValidators: true });
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }
    res.status(statusCodes.OK).json({ job });
}

const deleteJob = async(req, res) => {
    const { id: jobId } = req.params;
    const job = await Job.findOneAndDelete({ _id: jobId, createdBy: req.user.userid });
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }
    res.status(statusCodes.OK).json({ msg: 'Job deleted successfully' });
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
};