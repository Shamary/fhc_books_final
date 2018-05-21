Date.prototype.getWeek = function () {
    var target  = new Date(this.valueOf());
    var dayNr   = (this.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
}

var edit_map = {1:"Edit Targets - Weekly",2: "Edit Targets - EOY"};
var assign_map = {1:"Assign Targets - Weekly", 2:"Assign Targets - EOY"};

/*
function getDateRangeOfWeek(weekNo){
    var d1 = new Date();
    numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    var weekNoToday = d1.getWeek();
    var weeksInTheFuture = eval( weekNo - weekNoToday );
    d1.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));
    var rangeIsFrom = eval(d1.getMonth()+1) +"/" + d1.getDate() + "/" + d1.getFullYear();
    d1.setDate(d1.getDate() + 6);
    var rangeIsTo = eval(d1.getMonth()+1) +"/" + d1.getDate() + "/" + d1.getFullYear() ;
    //return rangeIsFrom + " to "+rangeIsTo;
    return d1.getDate();
};

console.log("dates: "+getDateRangeOfWeek(20));*/

$(document).ready(function(){

    if($("#manager_table").length)
    {
        $("body").css("background-image",'url("../../images/grid_back.png")');

        var m_table=$("#manager_table").DataTable({
            dom:"Bfrtip",
            autoWidth:false,
            buttons:[
                        {text:"Assign to BSR",
                         action: function()
                         {
                            window.location.href="/manager#assign";
                         },
                         className:"exportButton"
                        },
                        {extend:"excelHtml5", text:"Save as Excel", className:"exportButton"}, 
                        {extend:"pdf", text:"Save as PDF",className:"exportButton"}
                    ],
            footerCallback: function(row,data,start,end,display){
                var api= this.api();
                
                var sum=function(api,col)
                {
                    let res=api.column(col).data().reduce(function(a,b){
                        return a+b;
                    },0);

                    return res;
                }
                
                $(api.column(2).footer()).html("Total");
                $(api.column(3).footer()).html(sum(api,3)/1000000);
                $(api.column(4).footer()).html(sum(api,4)/1000000);
                $(api.column(5).footer()).html(sum(api,5));
                $(api.column(6).footer()).html(sum(api,6));
                $(api.column(7).footer()).html(sum(api,7));
                $(api.column(8).footer()).html(sum(api,8));
            },
            ajax:{
                url:'/targets',
                type:'POST',
                data: function(){
                    let sheet_sel=$("#_sel").val();

                    return {week_or_eoy:sheet_sel};
                },
                dataSrc:''
            },
            columns:[
                {data:'branch'},
                {data:'bsr_name'},
                {data:'position'},
                {data:'loans',
                    render: function(data)
                    {
                        return data/1000000;
                    }
                },
                {data:'deposits',
                    render: function(data)
                    {
                        return data/1000000;
                    }
                },
                {data:'debit_cards'},
                {data:'membership'},
                {data:'iTransact'},
                {data:'FIP'},
                {
                    data:null,
                    render:function(o)
                    {
                        return "<a href='#edit_targets'><span class='edit_btn' style='cursor:pointer; font-size:14pt;'>&#x270E;</span></a>";
                    }
                },
                {
                    data:null,
                    render: function(o)
                    {
                        return "<span class='text-danger del_btn' style='cursor:pointer; font-size:13pt;'>X</span>";
                    }
                }
            ],
            columnDefs:[
                {
                    targets: [1,9,10],
                    orderable:false
                }
            ]
        });

        getWeeksLeft();
        $("#_sel").change(function(){

            let val=$("#_sel").val()
            $(".w_or_y").val(val);

            $("#assign_label").text(assign_map[val]);
            $("#edit_label").text(edit_map[val]);

            m_table.ajax.reload();
        });

        $("#manager_table").click(function(event){//edit/delete targets
            if($(event.target).hasClass("edit_btn"))
            {
                let row= m_table.row($(event.target).closest("tr")).data();
    
                //console.log("loans = "+row.debit_cards);
    
                $("#bsr").val(row.bsr_name);
                $("#loans").val(row.loans);
                $("#deposits").val(row.deposits);
                $("#cards").val(row.debit_cards);
                $("#membership").val(row.membership);
                $("#iTransact").val(row.iTransact);
                $("#fip").val(row.FIP);
            }
            else
            {
                if($(event.target).hasClass('del_btn'))//delete
                {
                    let row = m_table.row($(event.target).closest("tr")).data();
                    let bsr=row.bsr_name;

                    $.post('/delete',{bsr:bsr},function(data){
                        m_table.ajax.reload();
                    });
                }
            }
        });
    }
    

    $("#targets").click(function(){
        window.location.replace('/manager');
    });

    function getWeeksLeft()
    {
        var d= new Date();

        $("#weeks_left").text((52-d.getWeek())+"");
    }
});