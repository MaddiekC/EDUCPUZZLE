const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const { JWT_SECRET, JWT_EXPIRATION_TIME } = require('../config/auth');

/**
 * Authenticates a user and returns a JWT token
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {string} - JWT token
 */
const authenticateUser = async (username, password) => {
    const user = await User.findOne({ username });

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error('Incorrect password');
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION_TIME
    });

    return token;
};

/**
 * Verifies the JWT token and retrieves the user's details
 * @param {string} token - The JWT token to verify
 * @returns {Object} - The decoded token with user details
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Registers a new user
 * @param {string} username - The desired username
 * @param {string} password - The desired password
 * @returns {Object} - The newly created user
 */
const registerUser = async (username, password) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        password: hashedPassword,
    });

    await newUser.save();
    return newUser;
};

/**
 * Logs out the user (this could just be a client-side action to delete the token)
 * @param {string} token - The JWT token to revoke
 */
const logoutUser = () => {
    // No es necesario hacer nada con el token en el servidor, 
    // ya que generalmente se maneja en el cliente
    return true;
};

module.exports = {
    authenticateUser,
    verifyToken,
    registerUser,
    logoutUser
};
