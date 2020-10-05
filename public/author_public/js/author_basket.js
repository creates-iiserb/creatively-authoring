
//var colors = ['bg-success','bg-warning' , 'bg-danger'];
//var colorindex = 0;

let getRVCurrentDate = function () {
    let dt = new Date();
    let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var ss = dt.getUTCSeconds();//secs
    var mm = dt.getUTCMinutes();//mins
    var hh = dt.getUTCHours();//hrs
    var dd = dt.getUTCDate();//dat

    // Jun 11 2018 05:28:30 UTC
    if (dd < 10) { dd = '0' + dd }//
    if (hh < 10) { hh = '0' + hh }//
    if (mm < 10) { mm = '0' + mm }//
    if (ss < 10) { ss = '0' + ss }//

    let cdate = month[dt.getUTCMonth()] + " " + dd + " " + dt.getUTCFullYear() + " " + hh + ":" + mm + ":" + ss + " UTC"
    return cdate;
  }

function SortByDateRV(arr, dateProp) {
    return arr.slice().sort(function (a, b) {
        var aa = new Date(a[dateProp]);
        var bb = new Date(b[dateProp]);
        return aa < bb ? 1 : -1;
    });
}


// function LoadBasketData()
// {   
    
//     $.ajax({
//         type    : "post",        
//         url     :  "/author_getBaseketQuestions",
//         dataType: "json",
//         success : function(data){
           
//            if(data.status=="ok")
//            {
//                 var bqNumber = (data.bquestions.length)?data.bquestions.length:'';
//                 $('#basketquestionCounter').html(bqNumber);
//                 if(bqNumber!='')
//                 $('#basketquestionCounter').show();
//                 //new 13sept18               
//                 sessionStorage['basketitems'] = JSON.stringify(data.bquestions);
               
                
//            }else
//            if(data.status=="fail")
//            {
//             sessionStorage['basketitems'] = JSON.stringify(data.bquestions);   
//            }
//         }
//     });
// }

function LoadRecentViewQuest(storagename)
{
    $.ajax({
        type    : "get",        
        url     :  "/author_getAllRecentViewQuestions",
        dataType: "json",
        success : function(data){
           
           if(data.status=="ok")
           {             
                sessionStorage[storagename] = JSON.stringify(data.recentViewQuestions); 
                // console.log('recent quest load');              
               
           }
        }
    });
 
}


function AddtoBasket(ele,qid,elementType)
{

    var basketTotal = $('#basketquestionCounter').html();
    var basketTotal = parseInt(basketTotal);

    if(basketTotal>=50 )
    {
        swal({
            title: 'Basket Limit',
            text: 'You can add only 50 questions in the basket',
            type: 'warning',
            confirmButtonClass: "btn btn-info btn-fill",
            buttonsStyling: false
        });

        return;
    }

    
    $.ajax({
        type    : "post",
        data    : {"question":qid},
        url     : "/author_addToBaseketQuestion",
        dataType: "json",
        success : function(data){
           if(data.status=="ok")
           {
                $('#basketquestionCounter').html(data.numberofquestions);
                $('#basketquestionCounter').show();
                //var tr = $("#"+ele).closest('tr').addClass('active');

              //it will be remove after confirmation
                //   if(elementType=='table')
                //   {              
                //     var text = $("#"+ele).closest('tr').children(":first").text();
                //     var icons = '<i class="fa fa-shopping-basket text-info" style="padding-left:3px;" ></i>';
                //     $("#"+ele).closest('tr').children(":first").html(text+icons);
                //   }
              //end it will be remove after confirmation
              
              //$("#"+ele).attr('disabled',true);
                $("#"+ele).addClass('inbasket');
                $("#"+ele).attr('title', 'In Basket')
                .tooltip('fixTitle')
                .tooltip('show');

              sessionStorage['basketitems'] = JSON.stringify(data.bquestions);
              if(data.questionstatus == 'New')
              {                  
                $.notify({          
                    message: "Question <b>"+qid+"</b>  has been added to basket."
                },{
                    type: 'success',
                    delay:1000,
                    placement: {
                    from: 'top',
                    align: 'center'
                    }
                });

              }else{

                $.notify({          
                    message: "Question <b>"+qid+"</b>  already exist in the basket."
                },{
                    type: 'info',
                    delay:1000,
                    placement: {
                    from: 'top',
                    align: 'center'
                    }
                });

              }  
              
    
           }else
           if(data.status=="maxlimit"){
                $('#basketquestionCounter').html(data.numberofquestions);
                $('#basketquestionCounter').show();
                swal({
                    title: 'Basket Limit',
                    text: 'You can add only 20 questions in the basket',
                    type: 'warning',
                    confirmButtonClass: "btn btn-info btn-fill",
                    buttonsStyling: false
                });
           }
        }
    });

}

function changecolor(tableid,storagename,elementType)
{ 
    var basketdata = (sessionStorage['basketitems']!=undefined)?JSON.parse(sessionStorage['basketitems']):[];
    var localdata = (sessionStorage[storagename]!=undefined)?JSON.parse(sessionStorage[storagename]):[];

    // console.log(localdata);

    if(elementType=='table')
    {
        var tabledata = $(tableid).bootstrapTable('getData');
        
        
        
        $.each(tabledata, function(key,value) {

            //basket question
            if(basketdata.indexOf(value.id)>-1)
            {
            
                //var tr = $("#tr"+value.id);
                // var tr = $("a[data-vid='vw"+value.id+"']" ).closest('tr');            
                // var text = tr.children(":first").text();
                // var icons = '<i class="fa fa-shopping-basket text-info" style="padding-right:3px;" ></i> &nbsp;';
                //tr.children(":first").html(icons+text);

                //new 
                //$("#ad"+value.id).attr('disabled',true);
                $("#ad"+value.id).addClass('inbasket');
                $("#ad"+value.id).attr('title', 'In Basket')
                .tooltip('fixTitle'); 
                //endnew
            
            }else
            {
                //new 
                //$("#ad"+value.id).removeAttr('disabled');
                $("#ad"+value.id).removeClass('inbasket');
                $("#ad"+value.id).attr('title', 'Add to basket')
                .tooltip('fixTitle');
                //endnew
            }

            //end of basket question

        
            //recent view
            var checkexist = localdata.filter(function(ele){
                        return ele.qid === value.id;
            });
        
        
            if(checkexist.length>0)
            {
                
                //var tr = $("#tr"+checkexist[0].qid);     
                var tr = $("a[data-vid='vw"+checkexist[0].qid+"']" ).closest('tr');
                //tr.addClass(checkexist[0].color); //multicolor
                //tr.addClass('bg-warning');
               // tr.addClass('bgviewcolor');
               // colorindex =  colors.indexOf(checkexist[0].color);
                //colorindex = (colorindex>0)?(colorindex-1):colorindex+1;
               // colorindex = colorindex+1;

                

                //time elapsed;
                var t2 = new Date(checkexist[0].datetime);
                var t1 = new Date();
                var diff = t1.getTime()-t2.getTime();             
                var secondes =  diff / 1000;
                secondes = Math.floor(secondes); 
                
                if(secondes>=60)
                {
                   var minute = Math.floor(secondes/60);
                   var text = "Viewed "+minute+"m ago";
                   if(minute>=60)
                   {
                       var hours = Math.floor(minute/60);
                       text = "Viewed "+hours+"h ago";
                   }

                }else
                {
                    var text = "Viewed "+secondes+"s ago";
                }

                $("a[data-vid='vw"+checkexist[0].qid+"']").attr('title', text)
                .tooltip('fixTitle');

                $("a[data-vid='vw"+checkexist[0].qid+"'] i").removeClass().addClass('fa fa-clock-o');  

                $("a[data-vid='vw"+checkexist[0].qid+"']").addClass('lastviewquest');
            }else
            {
               
                $("a[data-vid='vw"+value.id+"'] i").removeClass().addClass('fa fa-info-circle');
                $("a[data-vid='vw"+value.id+"']").removeClass('lastviewquest');
                $("a[data-vid='vw"+value.id+"']").attr('title', 'View Sample')
                .tooltip('fixTitle');
            }

            //end of recent view

        });
    }

}

function viewquestion(qid,storagename){
    var lengthofviewQuest = 20;
    var localdata = (sessionStorage[storagename] != undefined)?JSON.parse(sessionStorage[storagename]):[];
    // console.log("Before---");
    // console.log(localdata);

    var existInArray = localdata.findIndex(function(obj){
             return obj.qid === qid; 
    });

    //not in array then add to recent veiws
    if(existInArray===-1)
    {
        //colorindex = (colorindex>=2)?0:(colorindex+1); 
        //var currdatetime = new Date().toUTCString();
        var currdatetime = getRVCurrentDate();
        var data = {"qid":qid,"datetime":currdatetime};
       // console.log(data);
        if(localdata.length>lengthofviewQuest-1)
        {
            var lastRow = localdata[localdata.length-1];
            localdata.pop();
            
           // $("#tr"+firstrow.qid).removeClass();
          //$("a[data-vid='vw"+firstrow.qid+"']" ).closest('tr').removeClass();
          $("a[data-vid='vw"+lastRow.qid+"'] i").removeClass().addClass('fa fa-info-circle');         
          $("a[data-vid='vw"+lastRow.qid+"']").removeClass('lastviewquest');
          $("a[data-vid='vw"+lastRow.qid+"']").attr('title', 'View Sample')
                .tooltip('fixTitle');   
        
          // console.log(localdata)     
        }

        localdata.push(data);
        localdata = SortByDateRV(localdata, 'datetime');
       
        sessionStorage[storagename] = JSON.stringify(localdata);
        $("a[data-vid='vw"+qid+"'] i").removeClass().addClass('fa fa-clock-o');
        $("a[data-vid='vw"+qid+"']").addClass('lastviewquest');
        

        updateDbLastView(localdata);
      
       //$("#tr"+qid).addClass('bg-warning');
       // $("a[data-vid='vw"+qid+"']" ).closest('tr').addClass('bg-warning');
       // $("a[data-vid='vw"+qid+"']" ).closest('tr').addClass('bgviewcolor');
       //$("a[data-vid='vw"+qid+"']" ).closest('tr').addClass(colors[colorindex]); //multicolor
        
    }else{
        // if already in recent view update the time
        var viewrow = localdata[existInArray];
        //var currdatetime = new Date().toUTCString();
        var currdatetime = getRVCurrentDate();

        viewrow.datetime = currdatetime;        
        localdata[existInArray] = viewrow;  
        localdata = SortByDateRV(localdata, 'datetime');      
        sessionStorage[storagename] = JSON.stringify(localdata);
        $("a[data-vid='vw"+qid+"'] i").removeClass().addClass('fa fa-clock-o');
        updateDbLastView(localdata);       

    }

    //console.log(sessionStorage[storagename]);

    

}

function ObjectOrderByDate(arr, dateProp) {
    return arr.slice().sort(function (a, b) {
      return a[dateProp] < b[dateProp] ? 1 : -1;
    });
}

function filterbybasket(tableid,storagename,elementType)
{

  var basketdata = (sessionStorage['basketitems']!=undefined)?JSON.parse(sessionStorage['basketitems']):[];
  $(tableid).bootstrapTable('filterBy', {
    id: basketdata
  });

}

function filterbyview(tableid,storagename,elementType)
{
  
  var localdata = (sessionStorage[storagename]!=undefined)?JSON.parse(sessionStorage[storagename]):[];
  var sortarray = ObjectOrderByDate(localdata,"datetime");
  var data = localdata.map(function(obj){
           return obj.qid; 
  }); 

    //   console.log('Before sort',data);  
    //   var data = sortarray.map(function(obj){
    //            return obj.qid; 
    //   });
    //   console.log('After sort',data);
 
  $(tableid).bootstrapTable('filterBy', {
    id: data
  });

  

}

function updateLastViewTime(qid,storagename)
{


    var localdata = (sessionStorage[storagename]!=undefined)?JSON.parse(sessionStorage[storagename]):[];
    var index = localdata.findIndex(function(obj){
                return obj.qid === qid; 
    });
   

    if(index>-1)
    {
      //time elapsed;
      var t2 = new Date(localdata[index].datetime);
      var t1 = new Date();
      var diff = t1.getTime()-t2.getTime();             
      var secondes =  diff / 1000;
      secondes = Math.floor(secondes); 

      if(secondes>=60)
      {
          var minute = Math.floor(secondes/60);
          var text = "Viewed "+minute+"m ago";
          if(minute>=60)
          {
            var hours = Math.floor(minute/60);
            text = "Viewed "+hours+"h ago";
          }

      }else
      {
         var text = "Viewed "+secondes+"s ago";
      }

      $("a[data-vid='vw"+qid+"']").attr('title', text).tooltip('fixTitle');
  
  }

}

function enabledisableBasketIcons(tableid)
{
    var tabledata = $(tableid).bootstrapTable('getData');
    var basketdata = (sessionStorage['basketitems']!=undefined)?JSON.parse(sessionStorage['basketitems']):[];
    
            $.each(tabledata, function(key,value) {
                if(basketdata.indexOf(value.id)>-1)
                {
                // console.log(value.actions);
                var actionicons = $(value.actions);
                var basketicon = $('.basket', actionicons);
                var id= basketicon.prop('id');
                $("#"+id).attr('disabled','disabled');   
                $("#"+id).attr('title', 'In Basket')
                .tooltip('fixTitle');
                }
            });
    
}

function updateDbLastView(data)
{
    // console.log("After---");
    // console.log(data);
    $.ajax({
        type    : "post",        
        url     :  "/author_addrecentviewquestion",
        dataType: "json",
        data    : {recentView:data},
        success : function(data){
           
           if(data.status=="ok")
           {
               console.log('ok');               
           }else
           if(data.status=="fail")
           {
              console.log('fail');
           }
        }
    });
}





