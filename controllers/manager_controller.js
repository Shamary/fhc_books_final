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

        res.render('manager',{layout:'layout2',title:"Proposed Targets", user:user, manager:position, bsr:bsrs});
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

    week_or_eoy = null ? 1 : week_or_eoy; 
    //let sql=`SELECT * FROM manager_table WHERE manager = '${user}' AND week_or_eoy = 1`;

    //sql=`CALL get_manager_table('${user}',1)`;

    let sql = `SELECT distinct branch,bsr_name,position,loans,deposits,debit_cards,membership,iTransact,FIP FROM( 
        SELECT * FROM (SELECT manager,bsr_name,week_or_eoy,_target as loans FROM targets WHERE ftype = 'loans') a JOIN 
    
        (SELECT manager as manager2,week_or_eoy as week_or_eoy2,bsr_name as bsr_name2,_target as deposits FROM targets WHERE ftype = 'deposits') b  
        ON a.manager = b.manager2 AND a.week_or_eoy = b.week_or_eoy2 AND a.bsr_name = b.bsr_name2 JOIN 
    
        (SELECT manager as manager3,week_or_eoy as week_or_eoy3,bsr_name as bsr_name3,_target as debit_cards FROM targets WHERE ftype = 'debit_cards') c  
        ON a.manager = c.manager3 AND a.week_or_eoy = c.week_or_eoy3 AND a.bsr_name = c.bsr_name3 JOIN 
    
        (SELECT manager as manager4,week_or_eoy as week_or_eoy4,bsr_name as bsr_name4,_target as membership FROM targets WHERE ftype = 'membership') d  
        ON a.manager = d.manager4 AND a.week_or_eoy = d.week_or_eoy4 AND a.bsr_name = d.bsr_name4 JOIN 
    
        (SELECT manager as manager5,week_or_eoy as week_or_eoy5,bsr_name as bsr_name5,_target as iTransact FROM targets WHERE ftype = 'iTransact') e  
        ON a.manager = e.manager5 AND a.week_or_eoy = e.week_or_eoy5 AND a.bsr_name = e.bsr_name5 JOIN 
    
        (SELECT manager as manager6,week_or_eoy as week_or_eoy6,bsr_name as bsr_name6,_target as FIP FROM targets WHERE ftype = 'FIP') f  
        ON a.manager = f.manager6 AND a.week_or_eoy = f.week_or_eoy6 AND a.bsr_name = f.bsr_name6
    
        JOIN (SELECT branch,position,bsr_name as bsr_name7 from manager_table) g ON g.bsr_name7 = a.bsr_name) h WHERE manager = '${user}' AND week_or_eoy = ${week_or_eoy};`;

    /*
    if(week_or_eoy)
    {
        //sql=`SELECT * FROM manager_table WHERE manager = '${user}' AND week_or_eoy = ${week_or_eoy}`;
        sql=`CALL get_manager_table('${user}',${week_or_eoy})`;
    }*/

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