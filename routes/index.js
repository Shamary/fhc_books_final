var express = require('express');
var router = express.Router();

var controller=require("../controllers/controller");
var auth= require("../controllers/auth");

/* GET home page. */
router.get('/',auth.isLoggedIn,controller.homePage);
router.post('/books_data',controller.getTableData);
router.post('/books_update',controller.updateTable);
router.post('/update_headings',controller.updateDateHeading);
router.post('/update_db',controller.updateDB);
router.get('/login',auth.loginPage);
router.post('/login',auth.login);
router.post('/register',auth.registerUser);

router.post('/logout',auth.logout);

module.exports = router;
