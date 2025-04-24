const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
exports.createFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.create(req.body);
        
        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all feedbacks
// @route   GET /api/feedback
// @access  Private (Admin only)
exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private (Admin only)
exports.getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Admin only)
exports.updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}; 