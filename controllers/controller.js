var express = require('express');
var db=require("../config/db");
var date= require("date-and-time");

const WEEKLY_ACTUAL=1, WEEKLY_TARGET =2, WEEKLY_DIFF=3
      YTD_ACTUAL = 4, YTD_TARGET = 5, YTD_DIFF = 6;

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

var getType = function(result,type,ytd)
{
    let i=0;

    for(i=0;i<result.length;i++)
    {
        if((!ytd&&result[i].ftype_week==type)||(ytd&&result[i].ftype_ytd==type))
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

        let data = {loans:null,deposits:null,debit_cards:null,membership:null,iTransact:null,FIP:null};

        if(type==2)
        {
            data= {loans:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   deposits:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   cards:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   members:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   itransact:{weekly_actual: null, weekly_target:null,weekly_difference:null},
                   fip:{weekly_actual: null, weekly_target:null,weekly_difference:null}};
            
            if(result[getType(result,"loans")])
            {
                let lpos= getType(result,"loans"), dpos=getType(result,"deposits"), cpos=getType(result,"debit_cards"), 
                    mpos=getType(result,"membership"), ipos=getType(result,"iTransact"),fpos=getType(result,"FIP");
                    
                data= {loans:{weekly_actual: result[lpos].weekly_actual, 
                                weekly_target:result[lpos].weekly_target,
                                weekly_difference:result[lpos].weekly_difference},
                        deposits:{weekly_actual: result[dpos].weekly_actual, 
                                weekly_target:result[dpos].weekly_target,
                                weekly_difference:result[dpos].weekly_difference},
                        cards:{weekly_actual: result[cpos].weekly_actual, 
                                weekly_target:result[cpos].weekly_target,
                                weekly_difference:result[cpos].weekly_difference},
                        members:{weekly_actual: result[mpos].weekly_actual, 
                                weekly_target:result[mpos].weekly_target,
                                weekly_difference:result[mpos].weekly_difference},
                        itransact:{weekly_actual: result[ipos].weekly_actual, 
                                weekly_target:result[ipos].weekly_target,
                                weekly_difference:result[ipos].weekly_difference},
                        fip:{weekly_actual: result[fpos].weekly_actual, 
                                weekly_target:result[fpos].weekly_target,
                                weekly_difference:result[fpos].weekly_difference}};
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

                data= {loans:{ytd_actual: result[lpos].ytd_actual, 
                                ytd_target:result[lpos].ytd_target,
                                ytd_difference:result[lpos].ytd_difference},
                        deposits:{ytd_actual: result[dpos].ytd_actual, 
                                ytd_target:result[dpos].ytd_target,
                                ytd_difference:result[dpos].ytd_difference},
                        cards:{ytd_actual: result[cpos].ytd_actual, 
                                ytd_target:result[cpos].ytd_target,
                                ytd_difference:result[cpos].ytd_difference},
                        members:{ytd_actual: result[mpos].ytd_actual, 
                                ytd_target:result[mpos].ytd_target,
                                ytd_difference:result[mpos].ytd_difference},
                        itransact:{ytd_actual: result[ipos].ytd_actual, 
                                ytd_target:result[ipos].ytd_target,
                                ytd_difference:result[ipos].ytd_difference},
                        fip:{ytd_actual: result[fpos].ytd_actual, 
                                ytd_target:result[fpos].ytd_target,
                                ytd_difference:result[fpos].ytd_difference}};
            }
        }

        return data; 
    }
    
}

var handleResult= function(result)
{
    let monday=runAction(result[getDay(result,1)]);//result[getDay(result,1)];
    let tuesday=runAction(result[getDay(result,2)]);
    let wednesday=runAction(result[getDay(result,3)]);
    let thursday=runAction(result[getDay(result,4)]);
    let friday=runAction(result[getDay(result,5)]);

    let weekly = runAction(result,null,2);
    let ytd = runAction(result,null,3);
    
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
        ytd_actual:ytd.fip.ytd_actual, ytd_target:ytd.fip.ytd_target, ytd_difference:ytd.fip.ytd_difference}
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

    for(i=1;i<53;i++)
    {
        weeks[i-1]=i;
    }
    
    sql="SELECT * from books WHERE week=1";
    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }

        let mdate= runAction(result[getDay(result,1)],date.format);//date.format(result[getDay(result,1)].bdate,"M/D/YYYY");
        let tdate=runAction(result[getDay(result,2)],date.format);
        let wdate=runAction(result[getDay(result,3)],date.format);
        let thdate=runAction(result[getDay(result,4)],date.format);
        let fdate=runAction(result[getDay(result,5)],date.format);

        res.render('home', { title: 'Books', weeks:weeks, mdate:mdate, tdate:tdate, wdate:wdate, thdate:thdate, fdate:fdate , manager:position});
    });
    
}

exports.getTableData = function(req,res)
{
    //console.log("called query");

    let week=req.body.week;
    //console.log("week= "+week);
    var sql=`SELECT * FROM (SELECT week,loans,deposits,debit_cards,membership,iTransact,FIP,day FROM books WHERE week=1) b 
             LEFT JOIN books_weekly bw ON b.week = bw.wweek LEFT JOIN books_ytd ytd ON b.week=ytd.yweek`;
    
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
            final=handleResult(result);
        }
        //let table=JSON.stringify(result);
        console.log("sending: "+final);
        res.status(200).send(final);
    });
}

exports.updateTable=function(req,res)
{
    let week=req.body.week;
    //console.log("week= "+week);

    //var sql="SELECT loans,deposits,debit_cards,membership,iTransact,FIP,day FROM books WHERE week="+week+"";
    var sql=`SELECT * FROM (SELECT week,loans,deposits,debit_cards,membership,iTransact,FIP,day FROM books WHERE week= ${week}) b 
    LEFT JOIN books_weekly bw ON b.week = bw.wweek LEFT JOIN books_ytd ytd ON b.week=ytd.yweek`;

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
            final=handleResult(result);
        }
        console.log("total: "+final);

        res.status(200).send(final);
    });
}

exports.updateDateHeading=function(req,res)
{
    let week=req.body.week;
    //console.log("week heading= "+week);
    
    let mdate= "";
    let tdate="";
    let wdate="";
    let thdate="";
    let fdate="";

    sql="SELECT * from books WHERE week="+week;
    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }

        let local_res={mdate:"",tdate:"",wdate:"",thdate:"",fdate:""};

        //if(result.length>0)
        //{
        mdate= runAction(result[getDay(result,1)],date.format);
        tdate=runAction(result[getDay(result,2)],date.format);
        wdate=runAction(result[getDay(result,3)],date.format);
        thdate=runAction(result[getDay(result,4)],date.format);
        fdate=runAction(result[getDay(result,5)],date.format);

        local_res={mdate:mdate,tdate:tdate,wdate:wdate,thdate:thdate,fdate:fdate};

            //res.status(200).send(local_res);
        //}

        //res.status(200).send(local_res);
        res.json(local_res);
    });
}

exports.updateDB=function(req,res)
{
    let bdate=req.body.date;
    let loans=req.body.loans;
    let deposits=req.body.deposits;
    let cards=req.body.debit_cards;
    let membership=req.body.membership;
    let iTransact=req.body.itransact;
    let FIP=req.body.fip;

    let day=req.body.day;
    let week=req.body.week;

    let rtype= req.body.rtype;

    all_sql={0: "SELECT * FROM books WHERE day = "+day+" AND week = "+week,
             1: "SELECT weekly_actual FROM books_weekly WHERE wweek = "+week,
             2: "SELECT weekly_target FROM books_weekly WHERE wweek = "+week,
             3: "SELECT weekly_difference FROM books_weekly WHERE wweek = "+week,
             4: "SELECT ytd_actual FROM books_ytd WHERE yweek = "+week,
             5: "SELECT ytd_target FROM books_ytd WHERE yweek = "+week,
             6: "SELECT ytd_difference FROM books_ytd WHERE yweek = "+week};

    let sql="SELECT * FROM books WHERE day = "+day+" AND week = "+week;
    sql=all_sql[rtype];

    db.query(sql,function(err,result){
        if(err)
        {
            throw err;
        }

        if(result.length>0)
        {
            let values=[];
            if(rtype==0)
            {
                sql= "UPDATE books SET loans = "+loans+","+"deposits="+deposits+",debit_cards="+cards+",membership="+membership+
                ",iTransact="+iTransact+",FIP="+FIP+", bdate = '"+bdate+"' WHERE week = "+week+" AND day = "+day+"";
            }
            else 
            {
                let table="", cols=[];

                if(rtype==WEEKLY_ACTUAL)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]= "weekly_actual";
                    cols[2]= "wweek";                    
                }
                else if(rtype==WEEKLY_TARGET)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]= "weekly_target";
                    cols[2]= "wweek";                    
                }
                else if(rtype==WEEKLY_DIFF)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]= "weekly_difference";
                    cols[2]= "wweek";                    
                }
                else if(rtype==YTD_ACTUAL)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]= "ytd_actual";
                    cols[2]= "yweek";                    
                }
                else if(rtype==YTD_TARGET)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]= "ytd_target";
                    cols[2]= "yweek";                    
                }
                else if(rtype==YTD_DIFF)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]= "ytd_difference";
                    cols[2]= "yweek";                    
                }
                
                sql= `UPDATE ${table} SET ${cols[1]} = ${loans} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'loans';
                     UPDATE ${table} SET ${cols[1]} = ${deposits} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'deposits';
                     UPDATE ${table} SET ${cols[1]} = ${cards} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'debit_cards';
                     UPDATE ${table} SET ${cols[1]} = ${membership} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'membership';
                     UPDATE ${table} SET ${cols[1]} = ${iTransact} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'iTransact';
                     UPDATE ${table} SET ${cols[1]} = ${FIP} WHERE ${cols[2]} = ${week} AND ${cols[0]} = 'FIP';`;

                /*sql= `UPDATE ${table} SET ${cols[1]} = ? WHERE week = ? AND ${cols[0]} = ?`;

                //values=[['loans',loans],['deposits',deposits],['debit_cards',cards],['membership',membership],['iTransact',iTransact],['FIP',FIP]];
                values=[[loans,week,'loans']];*/
            }

            db.query(sql/*,values*/,function(err){
                if(err)
                {
                    throw err;
                }

                res.redirect("/");
            });
        }
        else
        {
            let values=[];

            sql= "INSERT INTO books(week,bdate,day,loans,deposits,debit_cards,membership,iTransact,FIP) VALUES ?";
            values=[[week,bdate,day,loans,deposits,cards,membership,iTransact,FIP]];

            if(rtype>0)
            {
                let table="", cols=[]; 

                if(rtype==WEEKLY_ACTUAL)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]="wweek";
                    cols[2]="weekly_actual";
                }
                else if(rtype==WEEKLY_TARGET)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]="wweek";
                    cols[2]="weekly_target";
                }
                else if(rtype==WEEKLY_DIFF)
                {
                    table="books_weekly";
                    cols[0]="ftype_week";
                    cols[1]="wweek";
                    cols[2]="weekly_difference";
                }
                else if(rtype==YTD_ACTUAL)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]="yweek";
                    cols[2]="ytd_actual";
                }
                else if(rtype==YTD_TARGET)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]="yweek";
                    cols[2]="ytd_target";
                }
                else if(rtype==YTD_DIFF)
                {
                    table="books_ytd";
                    cols[0]="ftype_ytd";
                    cols[1]="yweek";
                    cols[2]="ytd_difference";
                }

                sql= `INSERT INTO ${table}(${cols[0]},${cols[1]},${cols[2]}) VALUES ('loans',${week},${loans}),
                     ('deposits',${week},${deposits}),
                     ('debit_cards',${week},${cards}),
                     ('membership',${week},${membership}),
                     ('iTransact',${week},${iTransact}),
                     ('FIP',${week},${FIP})`;
                values=[[]];
            }

            db.query(sql,[values],function(err){
                if(err)
                {
                    throw err;
                }

                res.redirect("/");
            });
        }
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
                    ytd_actual:null, ytd_target:null, ytd_difference:null}
    ];

    return JSON.stringify(final);
}