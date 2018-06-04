var db=require("../config/db");
var date= require("date-and-time");

const WEEKLY_ACTUAL=1, WEEKLY_TARGET =2, WEEKLY_DIFF=3
      YTD_ACTUAL = 4, YTD_TARGET = 5, YTD_DIFF = 6;

var o_user="";

var getDay = function(result,day)
{
    let i=0;

    for(i=0;i<result.length;i++)
    {
        if(result[i].day==day)
        {
            break;
        }
    }

    return i;
}

var getType = function(result,type,ytd,target,w_or_y)
{
    let i=0;

    for(i=0;i<result.length;i++)
    {
        if((!ytd&&!target&&result[i].ftype_week==type)||(ytd&&result[i].ftype_ytd==type)
        ||(target&&result[i].ftype==type&&result[i].week_or_eoy==w_or_y))
        {
            break;
        }
    }

    return i;
}

var runAction=function(result,action,type)
{
    if(action)
    {
        if(result)
        {
            return action(result.bdate,"M/D/YYYY");
        }

        return "";
    }
    else
    {
        if(!type&&result)
        {
            return result;
        }

        let data = {loans:null,deposits:null,debit_cards:null,membership:null,iTransact:null,FIP:null,sold:null};

        if(type==2)
        {
            data= {loans:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   deposits:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   cards:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   members:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   itransact:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   fip:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   sold:{weekly_actual:null}};
            
            if(result[getType(result,"loans")])
            {
                let lpos= getType(result,"loans"), dpos=getType(result,"deposits"), cpos=getType(result,"debit_cards"), 
                    mpos=getType(result,"membership"), ipos=getType(result,"iTransact"),fpos=getType(result,"FIP"),
                    spos=getType(result,"sold");
                
                let lpos_t= getType(result,"loans",false,true,1), dpos_t=getType(result,"deposits",false,true,1), 
                    cpos_t=getType(result,"debit_cards",false,true,1), mpos_t=getType(result,"membership",false,true,1), 
                    ipos_t=getType(result,"iTransact",false,true,1),fpos_t=getType(result,"FIP",false,true,1);
                
                let sold_weekly = result[spos] == null ? 0 : result[spos].weekly_actual;

                data= {loans:{weekly_actual: result[lpos].weekly_actual, 
                                weekly_target:result[lpos_t]._target,
                                weekly_difference:result[lpos].weekly_difference},
                        deposits:{weekly_actual: result[dpos].weekly_actual, 
                                weekly_target:result[dpos_t]._target,
                                weekly_difference:result[dpos].weekly_difference},
                        cards:{weekly_actual: result[cpos].weekly_actual, 
                                weekly_target:result[cpos_t]._target,
                                weekly_difference:result[cpos].weekly_difference},
                        members:{weekly_actual: result[mpos].weekly_actual, 
                                weekly_target:result[mpos_t]._target,
                                weekly_difference:result[mpos].weekly_difference},
                        itransact:{weekly_actual: result[ipos].weekly_actual, 
                                weekly_target:result[ipos_t]._target,
                                weekly_difference:result[ipos].weekly_difference},
                        fip:{weekly_actual: result[fpos].weekly_actual, 
                                weekly_target:result[fpos_t]._target,
                                weekly_difference:result[fpos].weekly_difference},
                        sold:{weekly_actual: sold_weekly}};
            }
        }
        else if(type==3)
        {
            data= {loans:{ytd_actual: null, ytd_target:null,ytd_difference:null},
                   deposits:{ytd_actual: null, ytd_target:null,ytd_difference:null},
                   cards:{ytd_actual: null, ytd_target:null,ytd_difference:null},
                   members:{ytd_actual: null, ytd_target:null,ytd_difference:null},
                   itransact:{ytd_actual: null, ytd_target:null,ytd_difference:null},
                   fip:{ytd_actual: null, ytd_target:null,ytd_difference:null}};
            

            if(result[getType(result,"loans",true)])
            {
                let lpos= getType(result,"loans",true), dpos=getType(result,"deposits",true), cpos=getType(result,"debit_cards",true), 
                    mpos=getType(result,"membership",true), ipos=getType(result,"iTransact",true),fpos=getType(result,"FIP",true);

                let lpos_t= getType(result,"loans",false,true,2), dpos_t=getType(result,"deposits",false,true,2), 
                    cpos_t=getType(result,"debit_cards",false,true,2), mpos_t=getType(result,"membership",false,true,2), 
                    ipos_t=getType(result,"iTransact",false,true,2),fpos_t=getType(result,"FIP",false,true,2);

                data= {loans:{ytd_actual: result[lpos].ytd_actual, 
                                ytd_target:result[lpos_t]._target,
                                ytd_difference:result[lpos].ytd_difference},
                        deposits:{ytd_actual: result[dpos].ytd_actual, 
                                ytd_target:result[dpos_t]._target,
                                ytd_difference:result[dpos].ytd_difference},
                        cards:{ytd_actual: result[cpos].ytd_actual, 
                                ytd_target:result[cpos_t]._target,
                                ytd_difference:result[cpos].ytd_difference},
                        members:{ytd_actual: result[mpos].ytd_actual, 
                                ytd_target:result[mpos_t]._target,
                                ytd_difference:result[mpos].ytd_difference},
                        itransact:{ytd_actual: result[ipos].ytd_actual, 
                                ytd_target:result[ipos_t]._target,
                                ytd_difference:result[ipos].ytd_difference},
                        fip:{ytd_actual: result[fpos].ytd_actual, 
                                ytd_target:result[fpos_t]._target,
                                ytd_difference:result[fpos].ytd_difference}};
            }
        }

        return data; 
    }
    
}

var handleResult= function(result,week)
{
    let monday=runAction(result[getDay(result,1)]);//result[getDay(result,1)];
    let tuesday=runAction(result[getDay(result,2)]);
    let wednesday=runAction(result[getDay(result,3)]);
    let thursday=runAction(result[getDay(result,4)]);
    let friday=runAction(result[getDay(result,5)]);

    let weekly = runAction(result,null,2);
    let ytd = runAction(result,null,3);

    console.log("Begin merge");
    let merge=
    [{mon:monday.loans,tue:tuesday.loans,wed:wednesday.loans,thur:thursday.loans,fri:friday.loans, 
      weekly_actual:weekly.loans.weekly_actual, weekly_target:weekly.loans.weekly_target, weekly_difference:weekly.loans.weekly_difference, 
      ytd_actual:ytd.loans.ytd_actual, ytd_target:ytd.loans.ytd_target, ytd_difference:ytd.loans.ytd_difference},

    {mon:monday.deposits,tue:tuesday.deposits,wed:wednesday.deposits,thur:thursday.deposits,fri:friday.deposits, 
        weekly_actual:weekly.deposits.weekly_actual, weekly_target:weekly.deposits.weekly_target, weekly_difference:weekly.deposits.weekly_difference, 
        ytd_actual:ytd.deposits.ytd_actual, ytd_target:ytd.deposits.ytd_target, ytd_difference:ytd.deposits.ytd_difference},

    {mon:monday.debit_cards,tue:tuesday.debit_cards,wed:wednesday.debit_cards,thur:thursday.debit_cards,fri:friday.debit_cards, 
        weekly_actual:weekly.cards.weekly_actual, weekly_target:weekly.cards.weekly_target, weekly_difference:weekly.cards.weekly_difference, 
        ytd_actual:ytd.cards.ytd_actual, ytd_target:ytd.cards.ytd_target, ytd_difference:ytd.cards.ytd_difference},

    {mon:monday.membership,tue:tuesday.membership,wed:wednesday.membership,thur:thursday.membership,fri:friday.membership, 
        weekly_actual:weekly.members.weekly_actual, weekly_target:weekly.members.weekly_target, weekly_difference:weekly.members.weekly_difference,
        ytd_actual:ytd.members.ytd_actual, ytd_target:ytd.members.ytd_target, ytd_difference:ytd.members.ytd_difference},

    {mon:monday.iTransact,tue:tuesday.iTransact,wed:wednesday.iTransact,thur:thursday.iTransact,fri:friday.iTransact, 
        weekly_actual:weekly.itransact.weekly_actual, weekly_target:weekly.itransact.weekly_target, weekly_difference:weekly.itransact.weekly_difference, 
        ytd_actual:ytd.itransact.ytd_actual, ytd_target:ytd.itransact.ytd_target, ytd_difference:ytd.itransact.ytd_difference},

    {mon:monday.FIP,tue:tuesday.FIP,wed:wednesday.FIP,thur:thursday.FIP,fri:friday.FIP, 
        weekly_actual:weekly.fip.weekly_actual, weekly_target:weekly.fip.weekly_target, weekly_difference:weekly.fip.weekly_difference, 
        ytd_actual:ytd.fip.ytd_actual, ytd_target:ytd.fip.ytd_target, ytd_difference:ytd.fip.ytd_difference},

    {mon:monday.sold,tue:tuesday.sold,wed:wednesday.sold,thur:thursday.sold,fri:friday.sold, 
        weekly_actual:weekly.sold.weekly_actual, weekly_target:null, weekly_difference:null, 
        ytd_actual:null, ytd_target:null, ytd_difference:null}
    ];

    let final=JSON.stringify(merge);

    return final;
}

var setupSQL = function(sql,type)
{
    return sql[type];
}

exports.homePage=function(req,res)
{
    let position=req.session.position == "manager";

    let weeks=[];
    let i=0;

    let week=req.body.week;
    let user=req.session.user;

    for(i=1;i<53;i++)
    {
        weeks[i-1]=i;
    }
    
    /*if(!position)
    {
        sql=`CALL update_weekly_auto(1,'${user}'); SELECT * from books WHERE week=1`;
    }
    else
    {
        sql=`SELECT DISTINCT bsr_name FROM manager_table WHERE manager = '${user}'`;
    }*/

    sql=`SELECT DISTINCT bsr_name FROM manager_table WHERE manager = '${user}'`;
    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }

        /*let mdate= runAction(result[getDay(result,1)],date.format);//date.format(result[getDay(result,1)].bdate,"M/D/YYYY");
        let tdate=runAction(result[getDay(result,2)],date.format);
        let wdate=runAction(result[getDay(result,3)],date.format);
        let thdate=runAction(result[getDay(result,4)],date.format);
        let fdate=runAction(result[getDay(result,5)],date.format);*/

        let x=0,y=0;
        let bsr_names=[];

        for(x=0; x<result.length;x++)
        {
            if(result[x].bsr_name!=null)
            {
                bsr_names[x]=result[x].bsr_name;
            }
        }
        

        /*res.render('home', { title: 'Books', user:user,weeks:weeks, mdate:mdate, tdate:tdate, wdate:wdate, 
        thdate:thdate, fdate:fdate , manager:position, my_bsrs: bsr_names});*/

        res.render('home', { title: 'Books', user:user,weeks:weeks,manager:position,my_bsrs: bsr_names, 
                             table_name1:process.env.table_name1, table_name2:process.env.table_name2, show_t1:req.session.mod_t1});
    });
    
}

exports.getTableData = function(req,res)
{
    //console.log("called query");

    let week=req.body.week;
    let user=req.session.user;
    o_user=user;

    let bsr_to_view= req.body.bsr_to_view;

    console.log("week= "+week);
    var sql=`SELECT * FROM (SELECT * FROM books WHERE user ='${user}' AND week =${week}) b
             LEFT JOIN books_weekly b2 ON b2.wweek=b.week AND b2.user=b.user
             LEFT JOIN (SELECT ftype_ytd,yweek,ytd_actual,ytd_difference,user from books_ytd) as b3 
             ON b2.ftype_week = b3.ftype_ytd AND b3.user = b.user
             LEFT JOIN  (SELECT ftype,_target,bsr_name,week_or_eoy FROM targets WHERE bsr_name = '${user}') AS b4 ON b4.bsr_name= b.user
            `;
    
    if(bsr_to_view)
    {
        console.log("bsr to view = "+bsr_to_view);
        sql=`SELECT * FROM (SELECT * FROM books WHERE user ='${bsr_to_view}' AND week =${week}) b
             LEFT JOIN books_weekly b2 ON b2.wweek=b.week AND b2.user=b.user
             LEFT JOIN (SELECT ftype_ytd,yweek,ytd_actual,ytd_difference,user from books_ytd) as b3 
             ON b2.ftype_week = b3.ftype_ytd AND b3.user = b.user
             LEFT JOIN  (SELECT ftype,_target,bsr_name,week_or_eoy FROM targets WHERE bsr_name = '${bsr_to_view}') AS b4 ON b4.bsr_name= b.user
            `;
    }

    db.query(sql,function(err,result)
    {
        if(err)
        {
            throw err;
        }
        
        let final=setNullFinal();/*[{mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null},
            {mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null},
            {mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null}];*/
        
            if(result.length>0)
            {
                final=handleResult(result,week);
            }

            console.log("total: "+final);
            res.status(200).send(final);
    });
}

exports.updateTable=function(req,res)
{
    let week=req.body.week;
    let user=req.session.user;
    o_user=user;

    let bsr_to_view = req.body.bsr_to_view;

    let position= req.session.position == "manager";

    //console.log("week= "+week);

    //var sql="SELECT loans,deposits,debit_cards,membership,iTransact,FIP,day FROM books WHERE week="+week+"";
    var sql=`
    SELECT * FROM (SELECT * FROM books WHERE user ='${user}' AND week =${week}) b
    LEFT JOIN books_weekly b2 ON b2.wweek=b.week AND b2.user=b.user
    LEFT JOIN (SELECT ftype_ytd,yweek,ytd_actual,ytd_difference,user from books_ytd) as b3 
    ON b2.ftype_week = b3.ftype_ytd AND b3.user = b.user
    LEFT JOIN  (SELECT ftype,_target,bsr_name,week_or_eoy FROM targets WHERE bsr_name = '${user}') AS b4 ON b4.bsr_name= b.user`;

    if(bsr_to_view)
    {
        sql=`SELECT * FROM (SELECT * FROM books WHERE user ='${bsr_to_view}' AND week =${week}) b
             LEFT JOIN books_weekly b2 ON b2.wweek=b.week AND b2.user=b.user
             LEFT JOIN (SELECT ftype_ytd,yweek,ytd_actual,ytd_difference,user from books_ytd) as b3 
             ON b2.ftype_week = b3.ftype_ytd AND b3.user = b.user
             LEFT JOIN  (SELECT ftype,_target,bsr_name,week_or_eoy FROM targets WHERE bsr_name = '${bsr_to_view}') AS b4 ON b4.bsr_name= b.user
            `;
    }

    db.query(sql,function(err,result)
    {
        if(err)
        {
            throw err;
        }
        
        let final=setNullFinal();/*[{mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null},
                   {mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null},
                   {mon:null,tue:null,wed:null,thur:null,fri:null},{mon:null,tue:null,wed:null,thur:null,fri:null}];*/
        
        if(result.length>0)
        {
            final=handleResult(result,week);
        }
        console.log("total: "+final);

        res.status(200).send(final);
    });
}


exports.updateDB=function(req,res)
{
    //let bdate=req.body.date;
    let loans=req.body.loans;
    let deposits=req.body.deposits;
    let cards=req.body.debit_cards;
    let membership=req.body.membership;
    let iTransact=req.body.itransact;
    let FIP=req.body.fip;

    let day=req.body.day;
    let week=req.body.week;

    let rtype= req.body.rtype;

    let products_sold= req.body.products_sold;

    let user = req.session.user;

    let sql = `CALL add_to_books('${user}',${week},${day},${loans},${deposits},${cards},${membership},${iTransact},${FIP},${products_sold})`;

    db.query(sql,function(err){
        if(err)
        {
            throw err;
        }

        req.session.mod_t1=true;
        res.redirect("/");
    });
}

var setNullFinal = function()
{
    let final=[{mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null},
                {mon:null,tue:null,wed:null,thur:null,fri:null, weekly_actual:null, weekly_target:null, weekly_difference:null, 
                    ytd_actual:null, ytd_target:null, ytd_difference:null}
    ];

    return JSON.stringify(final);
}