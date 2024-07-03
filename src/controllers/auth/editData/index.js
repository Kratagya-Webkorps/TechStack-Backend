const bcrypt = require("bcryptjs");
const User = require("../../../models/user.models");

const MSG = {
  usernameNotExist: "Username is not found. Invalid login credentials.",
  wrongRole: "Please make sure this is your identity.",
  loginSuccess: "Your old password is correct .",
  wrongPassword: "Incorrect password.",
  loginError: "Oops! Something went wrong.",
};

const checkPassword = async (userRequest, role, res) => {
  try {
    const { username, password } = userRequest;
    
    let user;
    if (isEmail(username)) {
      user = await User.findOne({ email: username });
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(404).json({
        reason: "username",
        message: MSG.usernameNotExist,
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        reason: "role",
        message: MSG.wrongRole,
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({
        message: MSG.loginSuccess,
        success: true,
      });
    } else {
      return res.status(401).json({
        reason: "password",
        message: MSG.wrongPassword,
        success: false,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      reason: "server",
      message: MSG.loginError,
      success: false,
    });
  }
};

function isEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = checkPassword;
