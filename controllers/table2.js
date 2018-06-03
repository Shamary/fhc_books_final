var db = require("../config/db");

exports.getTableData = function(req,res)
{
    let user = req.session.user;
    let week = req.body.week;
    

    let sql = `SELECT * FROM books2 WHERE bsr = '${user}' AND week = ${week}`;

    db.query(sql,function(err,result){
        
        if(err)
        {
            throw err;
        }

        //handle result
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

        res.status(200).send('OK');
    });

}