var bcrypt = require("bcryptjs");
var salt=bcrypt.genSaltSync(10);

var db = require("../config/db");

exports.loginPage =function(req,res)
{
    req.session.user=null;
    res.render("login",{title:"Login"});
}

exports.login = function(req,res)
{
    let user=[];
    
    let _username=req.body.username;
    let _password=req.body.password;

     

    sql=`SELECT * FROM user WHERE _username = '${_username}'`;

    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }

        let found=false;
        let i=0;

        if(result.length>0)
        {
            for(i=0;i<result.length;i++)
            {
                if(bcrypt.compareSync(_password,result[i]._password))
                {
                    found=true;
                    break;
                }
            }
        }

        if(found)
        {
            req.session.user=_username;
            req.session.position = result[i].position;

            res.redirect("/");
        }
        else if(!found)
        {
            req.flash('alert','Incorrect username or password');
            res.redirect("/login");
        }
    });

}

exports.isLoggedIn=function(req,res,next)
{
    console.log("user = "+req.session.user);
    if(req.session.user!=null)
    {
        next();
    }
    else
    {
        res.redirect("/login");
    }
}

exports.registerUser=function(req,res)
{
    let _username=req.body.username;
    let _password=req.body.password;
    let _confirm_password = req.body.confirm_password;
    let position= req.body.position;

    if(_confirm_password!=_password)
    {
        req.flash("add_fail","passwords do not match");
        //res.status(400).send("password mismatch");
        res.redirect("/#add_user");
    }
    else
    {
        sql= `INSERT INTO user(_username,_password,position) VALUES ?`;
        let values= [[_username,bcrypt.hashSync(_password,salt),position]];

        db.query(sql,[values],function(err){
            if(err)
            {
                throw err;
            }

            req.flash("add_success","user added successfully");
            //res.status(200).send("OK");
            res.redirect("/#add_user");
        });
    }
}

exports.logout = function(req,res)
{
    req.session.user=null;
    req.session.position=null;

    res.status(200).send("OK");
}
