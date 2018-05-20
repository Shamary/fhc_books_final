var express = require('express');
var router = express.Router();

var controller=require("../controllers/controller");
var manager= require("../controllers/manager_controller");
var auth= require("../controllers/auth");

/* GET home page*/
router.get('/',auth.isLoggedIn,controller.homePage);
router.post('/books_data',controller.getTableData);
router.post('/books_update',controller.updateTable);
router.post('/update_headings',controller.updateDateHeading);
router.post('/update_db',controller.updateDB);
//router.post('/update_auto',controller.update_auto);

/**Manager handles**/
router.get('/manager',auth.isLoggedIn,auth.isManager,manager.managerPage);
router.post('/targets',auth.isLoggedIn,auth.isManager,manager.targetTable);
router.post('/assign',auth.isLoggedIn,auth.isManager,manager.assign_to_BSR);
router.post('/update_targets',auth.isLoggedIn,auth.isManager,manager.update_targets);

/**Auth**/
router.get('/login',auth.loginPage);
router.post('/login',auth.login);
router.post('/register',auth.registerUser);
router.post('/logout',auth.logout);

module.exports = router;
