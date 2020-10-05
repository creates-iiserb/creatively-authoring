var app = angular.module('workSheetApp',  ['ngTagsInput','frapontillo.bootstrap-switch','ui.sortable','ngValidate','angularUtils.directives.dirPagination','rzSlider']);

app.config(function ($validatorProvider) {
    $validatorProvider.setDefaults({
    errorElement: 'label',
    errorClass: 'jv-error'
    });

    $validatorProvider.addMethod("mintags", function (value, element) {		
		var val = JSON.parse(value);		
        var minval = parseInt($(element).attr('data-min'));
        return this.optional(element) || !(val.length<minval);        
    }, "Please enter minimum three tags.");
    
    $validatorProvider.addMethod("instDesc", function (value, element) {
        $("#instrDiv").html(value);
        var textval =  $.trim($("#instrDiv").text());
       // console.log(textval);
        return this.optional(element) || !(textval=='') ;        
    }, "This field is required.");

});



app.controller('workSheetController', function ($scope, $http, $timeout){
        $scope.utcToLocal=function(input){		
            var d = new Date(input);
            var time = d.toString().split(" ")[4];
            var getDate = d.getDate();
            var getMonth = d.getMonth() + 1;
            var getFullYear = d.getFullYear();
            if(getMonth < 10)
            getMonth = "0"+getMonth;
            if(getDate < 10)
            getDate = "0"+getDate;
            var startDate = getFullYear+"-"+getMonth+"-"+getDate;
            var updatedAt =  startDate.substring(0, 10) + " " + time;		
            return updatedAt;
        }

        
    // jquery parts
    $(document).ready(function() {
        $("#LiBasket").show();
        $("#freeExp").focus(function() { $(this).select(); } );
        $("#freeHint").focus(function() { $(this).select(); } );
        $("#freeItm").focus(function() { $(this).select(); } );

        // $("#helpAllowed").change(function(){
        //     $scope.$apply(function(){
                 
        //         for(var r=0;r<3;r++)
        //         {
        //             for(var c=0;c<3;c++)
        //             {   if(typeof $scope.sheetDta.wsGradingMatrix !== 'undefined')
        //                 $scope.sheetDta.wsGradingMatrix[r][c]=0;
        //             }
        //         }
       
        //     });
        // });


        // $('.nav-tabs a').on('shown.bs.tab', function(){
           
        //     if(window.location.href.indexOf("#"))
        //     {  
        //          var bURL = window.location.href.replace( /#!#(free|elements|properties|meta)/g, "" );                
        //         // window.history.replaceState(null, null, bURL);
        //          history.pushState(null, null, bURL);

        //     }
        // });

    });

    var charCountDesp = document.getElementById("charCountDesp");
    var maxCharCountDesp = document.getElementById("wsdescr").maxLength;
    CKEDITOR.instances.wsdescr.on("key", function (event)
    {
        charCountDesp.innerHTML = "Character Remaining: "+(maxCharCountDesp - CKEDITOR.instances.wsdescr.getData().length);
    });
    

    var maxCharCountInst = document.getElementById("wsinstr").maxLength;
    var charCountDcharCountInstesp = document.getElementById("charCountInst");
    CKEDITOR.instances.wsinstr.on("key", function (event)
    {
        charCountInst.innerHTML = "Character Remaining: "+(maxCharCountInst - CKEDITOR.instances.wsinstr.getData().length);
    });
    
    
    $scope.sliderItm = {
        value:  0,
        options: {
            floor: 0,
            ceil:  20,
            showSelectionBar: true
        }
    }
    
    $scope.sliderHint = {
        value: 0,
        options: {
            floor: 0,
            ceil:  20,
            showSelectionBar: true
        }
    }

    $scope.sliderExp = {
        value: 0,
        options: {
            floor: 0,
            ceil:  20,
            showSelectionBar: true
        }
    }
    
   
    
    // //input only integer
    // //customInputFilter define in author.js
    // customInputFilter(document.getElementById("freeExp"), function(value) {
        // return /^-?\d*$/.test(value); });
    // customInputFilter(document.getElementById("freeHint"), function(value) {
    // return /^-?\d*$/.test(value); });
    // customInputFilter(document.getElementById("freeItm"), function(value) {
    // return /^-?\d*$/.test(value); });

    //end of jquery parts    


    $scope.validationOptions = {
        ignore: [],
        debug: false,
        rules: {
            wsTitle: {
            required: true,
            remote:{
                url:"/author_checkWorksheetName",
                type:"post",
                data:{
                    wbId:function(){
                        return $("#wbID").val();
                    },
                    wsId:function(){
                        return $('#wsID').val();
                    }
                }
            }                
            },
            wsinstr :{
                required:true,
                instDesc:true
            },
            mode:{
                required:true
            },
            wsTime:{
                required:true,
                digits:true
                
            }

            },
            messages: {
                wsTitle:{                                  
                 remote : "This worksheet name is already exist."
                }
               
        },
        errorPlacement: function (error, element) {
            if (element.attr("id") == "wsinstr" || element.attr("id") == "wsdescr" ) {
                var parentid = "#"+element.attr("id")+"Div";
                $(parentid).append(error);
               
            } else {
                error.insertAfter($(element));
            }
        }
    };

    $scope.validationOptionsAddWS = {
        
        rules: {
            wsTitle: {
                    required: true,
                    remote:{
                        url:"/author_checkWorksheetName",
                        type:"post",
                        data:{
                            wbId:function(){
                                return $("#wbID").val();
                            }
                        }
                    }                
                }
            },
            messages: {
                wsTitle: {                                  
                         remote : "This worksheet name already exist."
            }
        }
    };


    //make question items sortable
    $scope.sortableItems = {
        placeholder: "ui-corner-all",
        connectWith: ".wsQuestions",
        forcePlaceholderSize: true
    };

    $scope.sortableWorkSheets = {       
        connectWith: ".wsList",
        forcePlaceholderSize: true
    };


//-----------------------get whote worksheet list----------------------------------------
    $scope.wsEditFunc = function(id){   
        $http.post("/author_getWorkSheetsData", { 'id': id }).then(function (callback) {
            // $scope.showHTML = true;
            if (callback.data.status==="success") {
                var data1 = callback.data;

                var basketCount = data1.basketCount;
                $scope.basket = basketCount;

                // var playlistdata = data1.playlistdata;
                // $scope.playlist = playlistdata;


                // for(var i=0; i<$scope.playlist.length;i++){
                //     var playlist1 = playlistdata[i];
                //     var content = playlist1[0];
                //     var ques = new Array();
                //     for(var k=0; k<content.length;k++){
                //     ques.push(content[k].item);
                //     }}

                var wsdta = data1.data;
                // var wsdta = JSON.parse(wsdata);
                // var basketCount = JSON.parse(basketCount); 
                       
                $scope.wbID = wsdta._id;
                $("#wbID").val(wsdta._id);
                $scope.author = wsdta.author;   
                $scope.version = wsdta.version;       
                $scope.worksheetDta = wsdta.dev;        
                $scope.sheets = wsdta.dev.sheets;
                $scope.sheetsList = angular.copy($scope.sheets);
                $scope.sheetsOrderList = angular.copy($scope.sheets);
                // $scope.basket = basketCount; 
                $scope.unauthData = [];
                $scope.helpLevelSel = [{id:2,value:"Hint and Explanation Allowed"},{id:1,value:"Hint Allowed"},{id:0,value:"No Help Allowed"}];

                $scope.helpLevelSelAtReview= [{id:2,value:"Hint and Explanation Allowed"},{id:1,value:"Hint Allowed"},{id:0,value:"No Help Allowed"}];
                // console.log($scope.sheets);

                $('.ALS').show();
                $('#LiBasket').show();
                
               
                //sessionStorage used for getting last working worksheet after page refresh
                var worksheetID = sessionStorage.getItem("EworksheetID");
                
                if(worksheetID !==null )
                {   /* false; it is used when we fetch data from
                       sessionStorage do not show error message when
                       workbook id and worksheet id is different */
        
                    $scope.getSheetDta(worksheetID,false);
                }

               


            }else if (callback.data.status === "authorError") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Worksheet not found'
                }).then(function () {
                    window.location = "/author_workbook_dash";
                });
            }else{
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            }
        },function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }


    $scope.refreshSlider = function () {
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });
    }; 

    $scope.$watch('sheetDta.free.hints', function(newvalue,oldvalue) {                     
                if(newvalue!=oldvalue)
                {
                    var items =  parseInt($scope.sheetDta.free.items);
                    var hints = $.trim(newvalue);
                    var hints = parseInt(hints);
                    if(hints>items)
                    {
                        $scope.sheetDta.free.hints = items;
                    }
                    
                    // if( hints!='' && isNaN(hints))
                    // {
                    //    $scope.sheetDta.free.hints = 0;
                    // }
                    
                    
                }
    });


    $scope.$watch('sheetDta.free.explanations', function(newvalue,oldvalue) {                     
        if(newvalue!=oldvalue)
        {
            var items =  parseInt($scope.sheetDta.free.items);
            var explanation = $.trim(newvalue);
            var explanation = parseInt(explanation);
           
            if(explanation>items)
            {
                $scope.sheetDta.free.explanations = items;
            }

            // if( explanation!='' && isNaN(explanation))
            // {
            //     $scope.sheetDta.free.explanation = 0;                
            // }
          
           
        }

       
    });


    $scope.$watch('sheetDta.tags',function(newV,oldV){
        if(newV!=oldV)
        {     
            if(newV.length>0){
              $("#mytags").val(JSON.stringify(newV));	
                $("#mytags").siblings("label.jv-error:contains('This field is required.')").remove();
                if(newV.length>=3)
                $("#mytags").siblings("label.jv-error:contains('Please enter minimum three tags.')").remove();
            }      	 
            else
            $("#mytags").val('');
        }
      },true);


      $scope.$watch('sheetDta.mode',function(newV,oldV){
        if(newV!=oldV)
        {     
            if(newV!=''){
               $("#mode").siblings("label.jv-error").remove();   
            }      	 
           
        }
      },true);


    

    //-----------------------get selected worksheet data----------------------------------------
    $scope.getSheetDta = function(wsid,status){
        
        var wbid = $scope.wbID; 
        var author = $scope.author;
        sessionStorage.setItem("EworksheetID", wsid);

        $http.post("/author_getSheetData", { 'wbid': wbid,'wsid':wsid,'author':author}).then(function (callback) {
             
            if (callback.data.status === "success") {
                $scope.unauthData = callback.data.unauthData;   
                $scope.sheetDta = callback.data.sheetData; 
                if($scope.sheetDta.random===undefined)
                {
                  $scope.sheetDta.random = false;                 
                }   
                
                if($scope.unauthData.length>0)
                {
                    $scope.sheetDta.publish = false;
                }
                
                var desc = $scope.sheetDta.wsDescp;
                var instr = $scope.sheetDta.wsInstr
                CKEDITOR.instances['wsdescr'].setData(desc);
                CKEDITOR.instances['wsinstr'].setData(instr);
                $scope.activeSheet = wsid;
                $("#wsID").val(wsid);
                $('#previewWSDiv').show();
                $('#editWSDiv').show();
                $('label.jv-error').remove();
               // $('#meta').trigger('click');

               
            //    setTimeout(()=>{
                   $scope.sliderItm = {
                    value:  $scope.sheetDta.free.items,
                    options: {
                      floor: 0,
                      ceil:  $scope.sheetDta.choose,
                      showSelectionBar: true
                    }
                  }
    
                  $scope.sliderHint = {
                    value:  $scope.sheetDta.free.hints,
                    options: {
                      floor: 0,
                      ceil:  $scope.sliderItm.value,
                      showSelectionBar: true
                    }
                  }
    
                  $scope.sliderExp = {
                    value:  $scope.sheetDta.free.explanations,
                    options: {
                      floor: 0,
                      ceil:  $scope.sliderItm.value,
                      showSelectionBar: true
                    }
                  }
               
                //   console.log($scope.sliderItm.value )
            //    },200);


            

              
         
               //open last tag
                //    if(window.location.hash) {
                //         var url = window.location.href;
                //         var hash = url.substring(url.indexOf('!#')+1);
                //         console.log(hash);
                //         $('.nav-tabs a[href="'+hash+'"]').tab('show');                
                //    } 
               $('.nav-tabs a[href="#meta"]').tab('show'); 
                
              
            }
            else if(callback.data.status === "Unauthorized"){
                if(status){
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to fetch data only if Worksheet is authored by you.'
                    });

                }
                
            }
            else if(callback.data.status === "error"){
                if(status)
                {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'Unable to process request.'
                    });

                }
                
            }
            else {
                if(status)
                {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'Something Went Wrong. Please Contact Administrator !!'
                    });

                }
                
            }
        },function (error) {
            if(status)
            {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });

            }
            
        });

        
    }


    $scope.$watch('sheetDta.choose', function(newvalue,oldvalue) {                     
        if(newvalue!=oldvalue)
        {
            $scope.sliderItm.options.ceil = newvalue; 
        }

       
    });

    $scope.$watch('sliderItm.value', function(newvalue,oldvalue) {                     
        if(newvalue!=oldvalue)
        {
            $scope.sliderHint.options.ceil = newvalue; 
        }

       
    });

    $scope.$watch('sliderItm.value', function(newvalue,oldvalue) {                     
        if(newvalue!=oldvalue)
        {
            $scope.sliderExp.options.ceil = newvalue; 
        }

       
    });

   //-----------------------get all basket questions and add it in element tab----------------------------------------
   //
    $scope.addAllBasketItms = function(){
        var author = $scope.author;
        var itmsids = $scope.sheetDta.elements.map(x=>x.id);       
        $http.post("/author_getAllBasketQues", { 'wsAuthor':author}).then(function (callback) {
                if (callback.data.status === "success") {
              //   console.log(callback.data.basketQues); choose
                 
                 callback.data.basketQues.forEach(function (doc) {
                    if(itmsids.indexOf(doc.id)===-1){
                        $scope.sheetDta.elements.push(doc);
                    }
                });

                callback.data.unauthData.forEach(function (unaid) {
                    if($scope.unauthData.indexOf(unaid)===-1){
                        $scope.unauthData.push(unaid);
                    }
                });

                if($scope.unauthData.length>0)
                {
                    $scope.sheetDta.publish = false;
                }

                $scope.sheetDta.choose = $scope.sheetDta.elements.length;

                // $("#choose").val($scope.sheetDta.elements.length);
                
             //   console.log("dddd");
            //    console.log($scope.sheetDta.elements);
                
                //$scope.sheetDta.elements = callback.data.basketQues;

            }else if(callback.data.status === "Unauthorized"){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'You are authorized to fetch data only if Worksheet is authored by you.'
                });
            }else if(callback.data.status === "empty basket"){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        },function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });

    }

  //-----------------------update selected worksheet data----------------------------------------
    $scope.updateSheetDta = function(frmWs){
        //
        // console.log($scope.sheetDta)
        

        CKEDITOR.instances.wsdescr.updateElement();
        CKEDITOR.instances.wsinstr.updateElement();

        if (frmWs.validate()) {

        var elementsLenght = $scope.sheetDta.elements.length;
        var choose = $scope.sheetDta.choose;
        var  freeItems =   $scope.sliderItm.value;

        $scope.sheetDta.free.hints = $scope.sliderHint.value;
        $scope.sheetDta.free.items = $scope.sliderItm.value;
        $scope.sheetDta.free.explanations = $scope.sliderExp.value;

        for(var r=0;r<3;r++)
        {
            for(var c=0;c<3;c++)
            {   if( $.trim($scope.sheetDta.wsGradingMatrix[r][c]) == '')
                $scope.sheetDta.wsGradingMatrix[r][c]=0;
                
            }
        }
        if(elementsLenght==0 )
        {
            swal({
                title: 'Worksheet Items',
                text: 'Worksheet items can not be empty.Please fetch worksheet items in the elements tab',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
           return;
        }
        if(choose==0 )
        {
            swal({
                title: 'Worksheet Items',
                text: 'select number of items in worksheet can not be 0',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
           return;
        }

        if(choose>elementsLenght)
        {
            swal({
                title: 'Worksheet Items',
                text: 'You cannot select number of items in worksheet more than total items',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
           return;
        }



        if($scope.unauthData.length>0)
        {
            swal({
                title: 'Unauthorized data',
                text: 'Their are some unauthorized items in this worksheet. You are authorized to keep content that is authored by you',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
           
            return;

        }

        if(elementsLenght>50)
        { 
            swal({
                title: 'Items Limit',
                text: 'Worksheet items can not be greater than 50',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
           
            return;
            
            
        }

        if(freeItems > choose)
        {
           

            swal({
                title: 'Free Item Limit',
                text: 'Number of free items can not be greater than number of worksheet items, Please edit value of items in free tab',
                type: 'error'
            //     confirmButtonClass: "btn btn-danger btn-fill",
            //     buttonsStyling: false
            });
           
            return;
        }

        if($scope.sheetDta.free.hints>freeItems || $scope.sheetDta.free.explanations > freeItems)
        {
            swal({
                title: 'Hints and explanation Limit',
                text: 'Hints and explanation can not greater than free items.',
                type: 'error'
                // confirmButtonClass: "btn btn-danger btn-fill",
                // buttonsStyling: false
            });
            return;
        }

        var description = CKEDITOR.instances['wsdescr'].getData();
        var instruction = CKEDITOR.instances['wsinstr'].getData();

        var tags = $scope.sheetDta.tags.map(function (val) {
            return val.text;
        });
       
        description = description.replace(/\n/g,'');
        description = description.replace(/\t/g,'');
        $scope.sheetDta.wsDescp = description;
       
        instruction = instruction.replace(/\n/g,'');
        instruction = instruction.replace(/\t/g,'');
        $scope.sheetDta.wsInstr = instruction;
    
        $scope.sheetDta.wsTitle = $scope.sheetDta.wsTitle.replace(/\s\s+/g, ' ').trim();
        $scope.sheetDta.wshelpAllowed = parseInt($scope.sheetDta.wshelpAllowed);
        $scope.sheetDta.helpLevelSelAtReview = parseInt($scope.sheetDta.helpLevelSelAtReview);
        var wbID = $scope.wbID;
        var author = $scope.author;
        var wstitle = $scope.sheetDta.wsTitle;
        var elements = angular.copy($scope.sheetDta.elements);
        var publish = $scope.sheetDta.publish;
// console.log($scope.sheetDta)
        $http.post("/author_updateSheetData", { 'sheetData': $scope.sheetDta,'tags': tags,'sheetID':$scope.activeSheet,'wbID': wbID,'author':author}).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: 'Worksheet Updated successfully'
                }).then(function () {
                   var sheetId =  $scope.activeSheet;
                   var sheetIndex = $scope.sheetsList.findIndex(x=> x.wsId == sheetId);
                   $scope.sheetsList[sheetIndex].wsTitle = wstitle
                   $scope.sheetsList[sheetIndex].elements = elements;
                   $scope.sheetsList[sheetIndex].publish = publish;
                   $scope.$digest();
                });

              }else if(callback.data.status === "Unauthorized"){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'You are authorized to update Worksheet that is authored by you.'
                });
            }else if(callback.data.status === "already"){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'This sheet name is already exist in the working workbook, Please change worksheet name.'
                });
            }
            else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        },function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });

      }else{
        
        swal({
            title: 'Empty Fields',
            text: 'All compulsory fields are required.',
            type: 'error'
            // confirmButtonClass: "btn btn-danger btn-fill",
            // buttonsStyling: false
        });
       
        return;
      }
    }   

  //-----------------------add new worksheet----------------------------------------
    $scope.saveNewWS = function(frmData){     
       

        if (frmData.validate()) {

            if($scope.sheetsList.length>=50)
            {
                swal({
                        title: 'WorkSheet Limit',
                        text: 'You can add only 50 worksheets',
                        type: 'error'
                        // confirmButtonClass: "btn btn-info btn-fill",
                        // buttonsStyling: false
                    });
                return;
            }
         
            var ws_name = $scope.wsTitle;
            var wbId = $scope.wbID;
            var author = $scope.author;
            //return;
            //edit below this function

            $http.post("/author_addNewWorksheet", { 'wbId': wbId,'ws_name':ws_name,'wbAuthor':author}).then(function (callback) {
               // console.log(callback);
                if (callback.data.status === "success") {
                    var rdata = callback.data;
                    swal({
                        type: 'success',
                        title: 'Success',
                        html: 'New Worksheet Added successfully'
                    }).then(function () {
                       // location.reload();
                       $scope.$apply(function(){
                        $scope.sheetsList.push(rdata.newWS);
                        $scope.sheetsOrderList.push(rdata.newWS);                       
                        $("#newWorksheet").modal("hide");
                       });
                       
                    });
                }else if(callback.data.status === "Unauthorized"){
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to add new Worksheet to the workbook that is authored by you.'
                    });
                }else {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }

                // setTimeout(()=>{
                //     $('.ld').hide();
                //     $('.wrapper').removeClass('ld-over-full-inverse running');
                //     $("#mainPanel").show();
                // },1000);
            },function (error) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });

      }
    }  

 //-----------------------add new worksheet----------------------------------------
 //
    $scope.fetchItms = function(){
        var plItems = document.getElementById('id_question').value;
        var author = $scope.author;
        if(plItems !=""){
                var itmsids = new Array();
                itmsids = plItems.split(",");
                
                $http.post("/author_getWorksheetPlaylistQuest", { 'wsAuthor':author,'plylistItms':itmsids}).then(function (callback) {
                    
                    if (callback.data.status === "success") { 
                        
                    var itmsids = $scope.sheetDta.elements.map(x=>x.id);   
                    callback.data.plylistData.forEach(function (doc) {
                        if(itmsids.indexOf(doc.id)===-1){
                            $scope.sheetDta.elements.push(doc);
                        }
                    });

                    callback.data.unauthData.forEach(function (unaid) {
                        if($scope.unauthData.indexOf(unaid)===-1){
                            $scope.unauthData.push(unaid);
                        }
                    });

                    if($scope.unauthData.length>0)
                    {
                    $scope.sheetDta.publish = false;
                    }

                    $('#playlistMdl').modal('hide');
                    $scope.sheetDta.choose = $scope.sheetDta.elements.length;
                    // $("#choose").val($scope.sheetDta.elements.length);
                
                }else if(callback.data.status === "Unauthorized"){
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to fetch data only if Worksheet is authored by you.'
                    });
                }else {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }
            },function (error) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });
           
        }else{
            swal({
                type: 'error',
                title: 'Error',
                html: 'Playlist Section is empty!!'
            });
        }
    }

    //----------------remove questions-------------
    $scope.removeWsQuest = function(qid){
       
        //var removeindex = $scope.sheetDta.elements.findIndex(x => x.id == qid);   
        var removeindex = $scope.sheetDta.elements.findIndex(x => x.id == qid);
        if(removeindex>-1)
        {
            $scope.sheetDta.elements.splice(removeindex, 1);
            // $("#choose").val($scope.sheetDta.elements.length);
            $scope.sheetDta.choose = $scope.sheetDta.elements.length;
        }
        
        var unauthDataIndex = $scope.unauthData.findIndex(x => x == qid);
      
        if(unauthDataIndex>-1)
        {
            $scope.unauthData.splice(unauthDataIndex, 1);
        }
        
    }

    //-------------update worksheet order------------
    $scope.saveWorksheetOrder = function(){
        var sortOrder =  $scope.sheetsOrderList.map(obj=>obj.wsId);
        var author = $scope.author;
        var wbid = $scope.wbID;

        if(sortOrder.length>0)
        {

                $http.post("/author_updateWsOrder", { 'wbAuthor':author,'sortOrder':sortOrder,'wbid':wbid}).then(function (callback) {                            
                if (callback.data.status === "success") {
                    
                    swal({
                        type: 'success',
                        title: 'Success',
                        html: 'Worksheets order change successfully'
                    }).then(function () {
                       // location.reload();
                       $scope.$apply(function() {
                        $scope.sheetsList = angular.copy($scope.sheetsOrderList);    
                        $('#sortWorksheetMdl').modal('hide');
                        });
                       
                    });
                   
                
                }else if(callback.data.status === "Unauthorized"){
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to fetch data only if Worksheet is authored by you.'
                    });
                }else {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }
            },function (error) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });


        }



    }


    $scope.NotCommitted = function(itms){
        if(itms.author != 'unknown')
        {
            if(!itms.committed)
                return true;
            else 
               return false;    
            
        }else{
            return false;
        }
        
    }

    $scope.sortWorkSheetMdl = function(){        
        $scope.sheetsOrderList = angular.copy($scope.sheetsList);
        $('#sortWorksheetMdl').modal('show');
    }

    $scope.addNewWorksheet = function(){

        if($scope.sheetsList.length>=50)
        {
            swal({
                    title: 'WorkSheet Limit',
                    text: 'You can add only 50 worksheets',
                    type: 'error'
                    // confirmButtonClass: "btn btn-info btn-fill",
                    // buttonsStyling: false
                });
            return;
        }
        $scope.wsTitle = '';
        $('#wsTitle-error').remove();
        $('#newWorksheet').modal('show');


    }

    
});



app.filter('workSheetFilter', function() {
    return function(input, searchText) {
        if(angular.isArray(input)) {
          if(searchText != null && searchText != ""){
            var filteredList = [];
                angular.forEach(input, function (val) {                     
                    if (val.wsTitle.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                        filteredList.push(val);
                    }else if( ("publish".search(searchText.toLowerCase())>-1  && val.publish==true))
                       filteredList.push(val);
                     else if( val.elements.length == parseInt(searchText) )
                       filteredList.push(val);
                    
                });
            input = filteredList;
          }        
       
        return input;
      }
    };
});
