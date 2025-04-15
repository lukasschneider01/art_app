const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Models
const User = require('../models/User');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   POST api/auth/register
// @desc    Register a user and request access
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      isApproved: false
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return success message
    res.json({ msg: 'Registration successful. Please wait for admin approval.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if user is approved (only for regular users)
    if (user.role === 'user' && !user.isApproved) {
      return res.status(403).json({ msg: 'Your account is pending approval' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/approve/:id
// @desc    Approve a user and send access email
// @access  Private/Admin
router.post('/approve/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate access token
    const accessToken = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Token valid for 7 days

    // Prepare email with access link
    const accessLink = `${process.env.FRONTEND_URL}/survey?token=${accessToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Art Survey Access Link',
      html: `
        <h2>Thank you for your interest in our Art Survey!</h2>
        <p>Your request has been approved. Please use the link below to access the survey:</p>
        <p><a href="${accessLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Access Survey</a></p>
        <p>This link will expire in 7 days.</p>
        <p>Best regards,<br>The Art Survey Team</p>
      `
    };

    try {
      console.log('Attempting to send email with the following configuration:');
      console.log(`Email User: ${process.env.EMAIL_USER}`);
      console.log('Email Password: [HIDDEN]');
      
      // Try to send email first
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
      
      // Only update user status after email is sent successfully
      user.isApproved = true;
      user.accessToken = accessToken;
      user.accessTokenExpires = expiryDate;
      await user.save();
      
      res.json({ msg: 'User approved and email sent successfully' });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      res.status(500).json({ 
        msg: 'Failed to approve user: Email sending failed',
        error: emailErr.message
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/verify-token/:token
// @desc    Verify access token
// @access  Public
router.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this token
    const user = await User.findOne({ 
      accessToken: token,
      accessTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({ valid: false, msg: 'Invalid or expired token' });
    }

    res.json({ 
      valid: true, 
      userId: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;