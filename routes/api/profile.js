const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');

// Models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get auth user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'No profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('status', 'Status is required').not().isEmpty(),
      body('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure fields off request object
    const {
      company,
      website,
      location,
      bio,
      status,
      github,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (github) profileFields.github = github;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social links object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Profile exists, Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      // No profile, Create new one
      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get user profile by ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == 'ObjectId')
      res.status(400).json({ msg: 'Profile not found' });
    res.status(500).send({ msg: 'Server error' });
  }
});

// @route   DELETE api/profile/
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // TODO REMOVE POSTS
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// EXPERIENCE

// @route   PUT api/profile/experience
// @desc    Add experience to Profile
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('company', 'Company is required').not().isEmpty(),
      body('from', 'Start date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });

      const { title, company, location, from, to, current, description } =
        req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from Profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Errors');
  }
});
module.exports = router;

// @route   PUT api/profile/education
// @desc    Add education to Profile
// @access  Private
router.put('education', [
  auth,
  [
    body('school', 'school is required.').not().isEmpty(),
    body('degree', 'degree is required.').not().isEmpty(),
    body('studyField', 'Field of study is required.').not().isEmpty(),
    body('from', 'Start date is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { school, degree, studyField, from, to, current, description } =
      req.body;
    const newEdu = {
      school,
      degree,
      studyField,
      from,
      to,
      current,
      description,
    };

    try {
      // Get profile
      const profile = await Profile.findOne({ user: req.user.id });
      // Add new education to beginning
      profile.education.unshift(newEdu);
      // Save profile
      await profile.save();
      // Return JSON
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  },
]);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from Profile
// @access  Private
router.delete('/education/:exp_id', auth, async (req, res) => {
  try {
    // Get Profile
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the index of education to be removed from array
    const removeIndex = profile.education
      .map((edu) => edu.id)
      .indexOf(req.params.edu_id);

    // Remove object from education array
    profile.education.splice(removeIndex, 1);

    // Save profile
    await profile.save();

    // Return JSON
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`,
    };

    const githubResponse = await axios.get(uri, { headers });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
