var http = require("http");

var bcrypt=require("bcryptjs");
var salt=bcrypt.genSaltSync(10);
var hash=bcrypt.hashSync("1234",salt);

http.createServer(function(req,res){
    res.write(hash);
    console.log("hash = "+hash);
}).listen(8100);