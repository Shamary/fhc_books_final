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
                        return "<a href='#popup_trigger'><span class='edit_btn' style='cursor:pointer'>&#x270E;</span></a>";
                    }
                },
            ],
            columnDefs:[
                {
                    targets: [1,9],
                    orderable:false
                }
            ]
        });


        $("#_sel").change(function(){
            $(".w_or_y").val($("#_sel").val());
            m_table.ajax.reload();
        });

        $("#manager_table").click(function(event){//edit targets
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
        });
        
    }
    

    $("#targets").click(function(){
        window.location.replace('/manager');
    });
});