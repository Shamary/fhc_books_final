var db = require("../config/db");

var getType = function(result,type,day)
{
    let i=0, res = null;

    if(result[0]==null)
    {
        return null;
    }

    for(i=0;i<result.length;i++)
    {
        if(result[i].info_for == type&&result[i].day == day)
        {
            res = result[i].val;
            break;
        }
    }

    return res;
}

var handleResult = function(result)
{
    let fres ={ data :
    [ 
        {
            mon: getType(result,'contacts',1), 
            tue: getType(result,'contacts',2),
            wed: getType(result,'contacts',3),
            thur: getType(result,'contacts',4),
            fri: getType(result,'contacts',5),
            total:0
        },
        {
            mon: getType(result,'leads',1), 
            tue: getType(result,'leads',2),
            wed: getType(result,'leads',3),
            thur:getType(result,'leads',4),
            fri: getType(result,'leads',5),
            total:0
        }
    ]};

    return JSON.stringify(fres);
}

exports.getTableData = function(req,res)
{
    let user = req.body.bsr_to_view == null ? req.session.user : req.body.bsr_to_view;
    let week = req.body.week;
    
    let final = [{mon:null,tue:null,wed:null,thur:null,fri:null}, //contacts
                 {mon:null,tue:null,wed:null,thur:null,fri:null}]; //leads

    let sql = `SELECT * FROM books2 WHERE bsr = '${user}' AND week = ${week}`;

    db.query(sql,function(err,result){
        
        if(err)
        {
            throw err;
        }

        //handle result
        final = handleResult(result);
        console.log("t2 res = "+final);

        res.status(200).send(final);
    });
}

exports.updateTable = function(req,res)
{
    let user = req.session.user;
    let week = req.body.week;
    let day = req.body.day;
    let contacts = req.body.contacts;
    let leads = req.body.leads;

    let sql = `CALL update_table2('${user}',${week},${day},${contacts},${leads})`;

    db.query(sql,function(err){
        if(err)
        {
            throw err;
        }

        req.session.mod_t1=false;
        res.redirect('/');
    });

}