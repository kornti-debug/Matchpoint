const express = require("express");
const router = express.Router();

// Home route: renders the index page
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;