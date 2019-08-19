var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index/index', {
    layout: 'index/layout',
    title: 'BeeBit Hive',
    active: {
      home: true,
      team: false,
      knowledge: false
    }
  });
});

/* GET How It Works. */
router.get('/knowledge', function(req, res, next) {
  res.render('index/knowledge', {
    layout: 'index/layout',
    title: 'BeeBit Hive',
    active: {
      home: false,
      team: false,
      knowledge: true
    }
  });
});

/* GET Meet the team. */
router.get('/team', function(req, res, next) {
  res.render('index/team', {
    layout: 'index/layout',
    title: 'BeeBit Hive',
    active: {
      home: false,
      team: true,
      knowledge: false
    }
  });
});

module.exports = router;