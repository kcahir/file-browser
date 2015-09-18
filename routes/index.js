var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index.html');
});

router.get('/directory', function(req, res, next) {

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");

    setTimeout(function() {
        res.json({
            'type': 'd',
            'name': 'dir name',
            'contents': [
                {
                    'type': 'd',
                    'name': 'dir name 1'
                },
                {
                    'type': 'd',
                    'name': 'dir name 2'
                },
                {
                    'type': 'f',
                    'name': 'file name 3'
                },
                {
                    'type': 'f',
                    'name': 'file name 4'
                }
            ]
        });
    }, 1000);

});

module.exports = router;
