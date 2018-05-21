var db= require("../config/db");

var getBSRs = function(req,res,to,user,position)
{
    let bsrs=[];

    sql=`SELECT * FROM user WHERE position = 'bsr' AND _username NOT IN(SELECT bsr_name FROM manager_table)`;
    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }
        let i=0;
        for(i=0;i<result.length;i++)
        {
            bsrs[i]=result[i]._username;
        }

        res.render('manager',{title:"Proposed Targets", user:user, manager:position, bsr:bsrs});
    });
}

exports.managerPage = function(req,res)
{
    let user= req.session.user;
    let position = req.session.position == "manager";

    getBSRs(req,res,'/manager',user,position);
}

exports.targetTable = function(req,res)
{
    let user= req.session.user;
    let week_or_eoy = req.body.week_or_eoy;

    let sql=`SELECT * FROM manager_table WHERE manager = '${user}' AND week_or_eoy = 1`;
    if(week_or_eoy)
    {
        sql=`SELECT * FROM manager_table WHERE manager = '${user}' AND week_or_eoy = ${week_or_eoy}`;
    }

    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }
        
        let data=JSON.stringify(result);
        console.log("manager data: "+data);
        
        res.status(200).send(data);
    });
}

exports.assign_to_BSR = function(req,res)
{
    let user=req.session.user;
    let bsr=req.body.bsr;
    let loans=req.body.loans;
    let deposits= req.body.deposits;
    let cards= req.body.debit_cards;
    let members=req.body.membership;
    let itransact= req.body.itransact;
    let fip = req.body.fip;

    let week_or_eoy= req.body.week_or_eoy;

    let sql=`CALL assign_to_bsr('${user}','${bsr}',${loans},${deposits},${cards},${members},${itransact},${fip},${week_or_eoy})`;

    db.query(sql,function(err){
        console.log("query: "+sql);
        if(err)
        {
            throw err;
        }

        req.flash("assign_success","Success");
        res.redirect('/manager#assign');
    });
}

exports.update_targets = function(req,res)
{
    let user=req.session.user;
    let bsr= req.body.bsr;
    let loans= req.body.loans;
    let deposits= req.body.deposits;
    let cards= req.body.debit_cards;
    let members = req.body.membership;
    let itransact = req.body.itransact;
    let fip= req.body.fip;
    let week_or_eoy = req.body.week_or_eoy;

    let sql= `CALL update_targets('${user}','${bsr}',${loans},${deposits},${cards},${members},${itransact},${fip},${week_or_eoy})`;

    db.query(sql,function(err){
        if(err)
        {
            throw err;
        }

        res.redirect('/manager');
    });
}

exports.delete = function(req,res)
{
    let user=req.session.user;
    let bsr=req.body.bsr;

    let sql= `DELETE FROM manager_table WHERE bsr_name = '${bsr}' AND manager = '${user}'`;
    db.query(sql,function(err){
        if(err)
        {
            throw err;
        }

        res.status(200).send("delete OK");
    });
}