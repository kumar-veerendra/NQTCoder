import Feedback from '../models/Feedback.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Submit feedback or bug report
 * @route   POST /api/feedback
 * @access  Public
 */
export const createFeedback = async (req, res) => {
  try {
    const { name: bodyName, email: bodyEmail, type, subject, message } = req.body;
    const name = req.user ? req.user.username : bodyName;
    const email = req.user ? req.user.email : bodyEmail;

    if (!name || !email || !type || !subject || !message) {
      return res.status(400).json({ message: 'All fields (Name, Email, Ticket Type, Subject, Message) are required.' });
    }

    if (!['feedback', 'bug', 'general'].includes(type)) {
      return res.status(400).json({ message: 'Invalid feedback type.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const feedbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      subject: subject.trim(),
      message: message.trim(),
      ...(req.user?._id && { user: req.user._id })
    };

    const feedback = new Feedback(feedbackData);
    const createdFeedback = await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully! Thank you for helping us improve.',
      feedback: createdFeedback
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all feedback and bug reports
 * @route   GET /api/feedback
 * @access  Private/Admin
 */
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update feedback status
 * @route   PATCH /api/feedback/:id
 * @access  Private/Admin
 */
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    feedback.status = status;
    const updatedFeedback = await feedback.save();

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete feedback entry
 * @route   DELETE /api/feedback/:id
 * @access  Private/Admin
 */
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
