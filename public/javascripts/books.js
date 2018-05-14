'use strict';

$(document).ready(function(e){
   
    if($("#books_table").length)
    {
        $("body").css("background-image",'url("../../images/grid_back.png")');

        const WEEKLY_ACTUAL=1, WEEKLY_TARGET =2, WEEKLY_DIFF=3,
            YTD_ACTUAL = 4, YTD_TARGET = 5, YTD_DIFF = 6;

        
        var labels=["Loans", "Deposits","Debit Cards","Membership","iTransact","FIP"];
        var days={1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday", 6:"Weekly Actual", 7: "Weekly Target", 8: "Weekly Difference",
                9: "YTD Actual", 10: "YTD Target", 11: "YTD Difference"};
        var type = {6:WEEKLY_ACTUAL,7:WEEKLY_TARGET,8:WEEKLY_DIFF,9:YTD_ACTUAL,10:YTD_TARGET,11:YTD_DIFF};

        var count=0;
        
        var week=1;

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
                    let week0={week:$("#sel_week").val()};
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
        
        $("th").click(function(){//edit column

            let pos=$(this).closest("th").index();
            //console.log("pos= "+pos);
            let date= $(this).find("span").text();
            //console.log("date = "+date);
            $("#date").val(moment(date).format("YYYY-MM-DD"));
            $("#date, #date_label").css("visibility","visible");
            if(pos>5)
            {
                $("#date, #date_label").css("visibility","hidden");
                $("#date").val("2018-01-01");
                $("#rtype").val(type[pos]);
            }

            $("#day").text(days[pos]);

            $("#day0").val(pos);
            $("#week").val($("#sel_week").val());

            let data=table.column(pos).data();

            $("#loans").val(data[0]);
            $("#deposits").val(data[1]);
            $("#cards").val(data[2]);
            $("#membership").val(data[3]);
            $("#iTransact").val(data[4]);
            $("#fip").val(data[5]);
        });

        /*function edit(event)
        {
            let pos=$(event).closest("th").index();
            console.log("pos= "+pos);

            table.column(pos).data();
        }*/
        
        selWeek(table);
        
        function selWeek(table)//select week
        {
            $("#sel_week").change(function(){
                count=0;
                table.ajax.url("/books_update").load();
                $.post('/update_headings',{week:$("#sel_week").val()},function(result){

                    //console.log("result= "+result.mdate);
                    $("#mdate").text(result.mdate);
                    $("#tdate").text(result.tdate);
                    $("#wdate").text(result.wdate);
                    $("#thdate").text(result.thdate);
                    $("#fdate").text(result.fdate);
                });
            });
        }

        $("#add_user_btn").click(function(){
            $.post("/register",$("add_user_form").serialize(),function(data){
                console.log("data: "+data);
                $("#add_result").html('<label class="text-white bg-success text-center w-100 p-3">'+"s"+'</label>');
            });
        });

        $("#logout").click(function(){
            $.post("/logout",function(data){
                location.replace("/login");
            });
        });
    }
});

