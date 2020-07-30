const { Router } = require('express');

router.get('/documentacion', (req, res) => {
    res.render('index');
});

module.exports = router;