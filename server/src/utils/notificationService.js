const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single notification for one recipient
 */
const createNotification = async ({ recipient, type, title, message, link = '/' }) => {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (err) {
    // Never let a notification failure crash the main action
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
};

/**
 * Notify all admins at once
 */
const notifyAllAdmins = async ({ type, title, message, link = '/' }) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (!admins.length) return;
    const docs = admins.map((admin) => ({
      recipient: admin._id,
      type,
      title,
      message,
      link,
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.error('[NotificationService] Failed to notify admins:', err.message);
  }
};

module.exports = { createNotification, notifyAllAdmins };
