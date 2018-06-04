'use strict';

let date=new Date();

function getDateRangeOfWeek(weekNo,addOn){
    let prev_month = 0;

    var d1 = new Date();
    let numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    var weekNoToday = d1.getWeek();
    var weeksInTheFuture = eval( weekNo - weekNoToday );
    d1.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));

    var rangeIsFrom = eval(d1.getMonth()+1) +"/" + (d1.getDate()) + "/" + d1.getFullYear();
    
    d1.setDate(d1.getDate() + addOn);
    var rangeIsTo = eval(d1.getMonth()+1) +"/" + d1.getDate() + "/" + d1.getFullYear() ;
    //return rangeIsFrom + " to "+rangeIsTo;
    return rangeIsTo;
};

$(document).ready(function(e){
   
    if($("#books_table").length)
    {
        $("body").css("background-image",'url("../../images/grid_back.png")');

        const WEEKLY_ACTUAL=1, WEEKLY_TARGET =2, WEEKLY_DIFF=3,
            YTD_ACTUAL = 4, YTD_TARGET = 5, YTD_DIFF = 6;

        
        var labels=["Loans", "Deposits","Debit Cards","Membership","iTransact","FIP","Products Sold"];
        var labels_t2 = ["Contacts","Leads"];
        
        var actual_labels = {0:"actual_loans", 1:"actual_deposits",2:"actual_cards",3:"actual_membership",4:"actual_itransact",5:"actual_fip"};
        var diff_labels= {0:"diff_loans", 1:"diff_deposits",2:"diff_cards",3:"diff_membership",4:"diff_itransact",5:"diff_fip"};
        
        var days={1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday", 6:"Weekly Actual", 7: "Weekly Target", 8: "Weekly Difference",
                9: "YTD Actual", 10: "YTD Target", 11: "YTD Difference"};

        var type = {6:WEEKLY_ACTUAL,7:WEEKLY_TARGET,8:WEEKLY_DIFF,9:YTD_ACTUAL,10:YTD_TARGET,11:YTD_DIFF};

        var count=0, count2 = 0;
        
        var week=1;

        set_to_cur_week();
        var table=$("#books_table").DataTable({
            ordering:false,
            dom:"Bfrtip",
            autoWidth:false,
            buttons:[{extend:"excelHtml5", text:"Save as Excel", className:"exportButton"}, {extend:"pdf", text:"Save as PDF",className:"exportButton"}],
            ajax:{
                url:"/books_data",
                type:"POST",
                data: function()
                {
                    //week=$("#sel_week").val();
                    //return JSON.stringify({week:week});
                    let week0={week:$("#sel_week").val(), bsr_to_view: $("#sel_bsr").val()};
                    return week0;
                },
                dataSrc:'',
            },
            columns:[
                {
                    data:null,
                    render: function(o){
                        if(count<labels.length)
                        {
                            return "<span>"+labels[count++]+"</span>";
                        }
                        return "";
                    }
                },
                {data:'mon'},
                {data:'tue'},
                {data:'wed'},
                {data:'thur'},
                {data:'fri'},
                {data:'weekly_actual'},
                {data:'weekly_target'},
                {data:'weekly_difference'},
                {data:'ytd_actual'},
                {data:'ytd_target'},
                {data:'ytd_difference'}
                /*{
                    data:null,
                    render:function(o)
                    {
                        return "<span>&#x270E;</span>";
                    }
                }*/
            ]
        });
        
        $("#books_table th").click(function(){//edit column

            let pos=$(this).closest("th").index();
            //console.log("pos= "+pos);
            let date= $(this).find("span").text();
            //console.log("date = "+date);
            /*$("#date").val(moment(date).format("YYYY-MM-DD"));
            $("#date, #date_label").css("visibility","visible");*/
            if(pos>5)
            {
                $("#date, #date_label").css("visibility","hidden");
                $("#date").val("2018-01-01");
                $("#rtype").val(type[pos]);
            }

            $("#day").text(days[pos]);
            $("#d_date").text($(this).find("span").text());

            $("#day0").val(pos);
            $("#week").val($("#sel_week").val());

            let data=table.column(pos).data();

            $("#loans").val(data[0] ? data[0] : 0);
            $("#deposits").val(data[1] ? data[1] : 0);
            $("#cards").val(data[2] ? data[2] : 0);
            $("#membership").val(data[3] ? data[3] : 0);
            $("#iTransact").val(data[4] ? data[4] : 0);
            $("#fip").val(data[5] ? data[5] : 0);
            $("#products_sold").val(data[6] ? data[6] : 0);
        });

        var table2 = $("#books_table2").DataTable({
            ordering:false,
            dom : "Bfrtip",
            autoWidth:false,
            buttons : [{extend:"excelHtml5", text:"Save as Excel", className:"exportButton"}, 
                       {extend:"pdf", text:"Save as PDF",className:"exportButton"}],
            initComplete: function(settings,json)
            {
                //sum row
                let api= this.api();
                let r1 = api.row(0).data();
                let r2 = api.row(1).data();
                //console.log(JSON.stringify(json));
                //json=JSON.stringify(json);
                //console.log("mon = "+r1.mon);
                let c_sum =fn(r1.mon)+fn(r1.tue)+fn(r1.wed)+fn(r1.thur)+fn(r1.fri);
                let l_sum =fn(r2.mon)+fn(r2.tue)+fn(r2.wed)+fn(r2.thur)+fn(r2.fri);

                api.cell(0,6).data(c_sum).draw(); 
                api.cell(1,6).data(l_sum).draw();
                
                //let sum = r_data[1]+r_data[2]+r_data[3]+r_data[4]+r_data[5];
            },
            ajax: {
                url : "/get_table2",
                type: "POST",
                data : function(){
                    let _data={week:$("#sel_week").val(), bsr_to_view: $("#sel_bsr").val()};
                    return _data;
                },
                datatSrc : ''
            },
            columns : [
                {
                    data:null,
                    render: function(o)
                    {
                        return '<span>'+labels_t2[count2++]+'</span>';
                    }
                },
                {data:'mon'},
                {data:'tue'},
                {data:'wed'},
                {data:'thur'},
                {data:'fri'},
                {
                   data:'total'
                }
            ]
        });
        
        $("#books_table2 th").click(function(){//edit column

            let pos=$(this).closest("th").index();
            let date= $(this).find("span").text();

            $("#t2_day_head").text(days[pos]);
            $("#t2_date").text($(this).find("span").text());

            $("#t2_day").val(pos);
            $("#t2_week").val($("#sel_week").val());

            let data=table2.column(pos).data();

            $("#contacts").val(data[0] ? data[0] : 0);
            $("#leads").val(data[1] ? data[1] : 0);
        });

        setDate();
        selWeek(table);
        removeCpy("#sel_week");

        $("#sel_bsr").change(function(){
            count=0;
            count2=0;
            table.ajax.reload();
            table2.ajax.reload();
        });

        function selWeek(table)//select week
        {
            $("#sel_week").change(function(){
                count=0;
                count2=0;

                //table.ajax.url("/books_update").load();
                table.ajax.reload();
                table2.ajax.reload();
                setDate();
                removeCpy("#sel_week");
            });
        }

        function set_to_cur_week()
        {
            $("#sel_week").val(date.getWeek());
        }

        function setDate()
        {
            $(".mdate").text(getDateRangeOfWeek($("#sel_week").val(),0));
            $(".tdate").text(getDateRangeOfWeek($("#sel_week").val(),1));
            $(".wdate").text(getDateRangeOfWeek($("#sel_week").val(),2));
            $(".thdate").text(getDateRangeOfWeek($("#sel_week").val(),3));
            $(".fdate,#weekly_date").text(getDateRangeOfWeek($("#sel_week").val(),4));
        }

        function selBSR()
        {
            $("#sel_bsr").change(function(){
                table.ajax.url().load();
                table2.ajax.url().load();
            });
            
        }
    }
    
    $(".btn_link").click(function(e){
        $(".panel_div").collapse("toggle");
    });

    $("#add_user_btn").click(function(){
        $.post("/register",$("#add_user_form").serialize(),function(data){
            console.log("data: "+data);
            $("#add_result").html('<label class="text-white bg-success text-center w-100 p-3">'+"s"+'</label>');
        });
    });

    $("#logout").click(function(){
        $.post("/logout",function(data){
            location.replace("/login");
        });
    });

    function removeCpy(id)
    {
        var usedNames = {};
        $(id).each(function () {
            if(usedNames[this.text]) {
                $(this).remove();
            } else {
                usedNames[this.text] = this.value;
            }
        });
    }

    function fn(val)//filter out nulls
    {
        return val == null ? 0 : val;
    }

});

