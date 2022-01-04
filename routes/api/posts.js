const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// TODO
// UNLIKE (within PUT likes)
// COMMENT UPDATE

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/post/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [body('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Models
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ msg: 'Post not found' });
    }

    // Check post ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Access Denied. Not Authorized' });
    }

    await post.remove();
    res.json({ msg: 'Post deleted' });
  } catch (error) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

//////// LIKES //////////

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  // !!! TODO - Unlike post if already liked
  // Likes - an array of objects [ {user: user.id} ]
  try {
    const post = await Post.findById(req.params.id);
    // Check likes nr. by current user
    const userLikes = post.likes.filter((like) => {
      // Returns an array of likes for current post by current user
      like.user.toString() === req.user.id;
    });
    // Avoid multiple likes
    if (userLikes > 0) {
      // !!! TODO - UNLIKE POST IF ALREADY LIKED !!!
      // If at least one like in the array, return 400
      return res.status(400).json({ msg: 'Can only like posts once' });
    }

    // Get remove index
    // const removeIndex = post.likes
    //   .map((like) => like.user.toString())
    //   .indexOf(req.user.id);
    // post.likes.splice(removeIndex, 1)

    // Like post
    post.likes.unshift({ user: req.user.id });

    // Save post
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

//////// COMMENTS //////////

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comment/:id',
  [auth, [body('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      res.status(500).send('Server errror');
    }
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a post
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    // Get post
    const post = await Post.findById(req.params.id);
    // Extract comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // CHECK 404 Not found
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    // CHECK ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Access Denied. Not Authorized' });
    }

    // Get index of comment
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    // Remove comment
    post.comments.splice(removeIndex, 1);
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/comment/:id/:comment_id
// @desc    Edit a comment on a post
// @access  Private
router.put('/comment/:id/:comment_id', [
  auth,
  [body('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    // TODO COMMENT UPDATE
  },
]);

module.exports = router;
