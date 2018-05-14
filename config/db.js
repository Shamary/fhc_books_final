var mysql=require("mysql");

var db=mysql.createConnection({
   host:process.env.HOST,
   user:process.env.DB_USERNAME,
   password:process.env.DB_PASSWORD,
   database:process.env.DB_NAME,
   multipleStatements:true
});

db.connect();

module.exports = db;