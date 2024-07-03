// Modules
const bcrypt = require("bcryptjs");

// Imports
const {
  validateEmail,
  validateUsername,
  updatePasswordSchema,
} = require("../validate");
const User = require("../../../models/user.models");

/**
 * Contains messages returned by the server when exceptions are caught.
 * @const MSG
 */
const MSG = {
  userNotFound: "User not found.",
  invalidCurrentPassword: "Current password is incorrect.",
  usernameExists: "Username is already taken.",
  emailExists: "Email is already registered.",
  updatePasswordSuccess: "Password updated successfully.",
  updatePasswordError: "Unable to update the password.",
};

/**
 * Updates an existing user's password.
 * @async
 * @function updatePassword
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} contains 2 attributes {error/success message: string, success: boolean}.
 */
const updatePassword = async (userRequest, res) => {
  try {
    const { username, email, currentPassword, newPassword } = userRequest;

    // Validate the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: MSG.userNotFound,
        success: false,
      });
    }

    // Validate the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: MSG.invalidCurrentPassword,
        success: false,
      });
    }

    // Validate the username if it's changing
    if (user.username !== username) {
      const usernameNotTaken = await validateUsername(username);
      if (!usernameNotTaken) {
        return res.status(400).json({
          message: MSG.usernameExists,
          success: false,
        });
      }
    }

    // Validate the email if it's changing
    if (user.email !== email) {
      const emailNotRegistered = await validateEmail(email);
      if (!emailNotRegistered) {
        return res.status(400).json({
          message: MSG.emailExists,
          success: false,
        });
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user details
    user.username = username;
    user.email = email;
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: MSG.updatePasswordSuccess,
      success: true,
    });
  } catch (err) {
    let errorMsg = MSG.updatePasswordError;
    if (err.isJoi === true) {
      err.status = 400;
      errorMsg = err.message;
    }
    return res.status(500).json({
      message: errorMsg,
      success: false,
    });
  }
};

module.exports = updatePassword;
