const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { body, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route POST api/users
// @desc  Register User
// @access  Public
router.post(
  '/',
  body('name', 'Please enter a name').not().isEmpty(),
  body('email', 'Please enter an email').not().isEmpty(),
  body('password', 'Please enter a valid password').isLength({ min: 6 }),
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        // User already exists
        // Keep errors same format as validator
        // { errors: [ { msg: "Error msg"} ] }
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get user avatar
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

      user = new User({ name, email, avatar, password });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to DB
      await user.save();

      // Generate and return JWT (to auth user after registration)
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        // Optional:
        { expiresIn: 3600 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
