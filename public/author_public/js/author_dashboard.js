$(document).ready(function() {
        if (window.location.search.indexOf('msg=dberror') > -1) {
             $.notify({
                icon: "",
                message: "Error occurs during fetching your data, Please Contact Administrator !!"
              },{
                type: "danger",
                timer: 4000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
              });

              var currrentUrl =  window.location.href;
              var newUrl =  currrentUrl.split("?")[0];           
              window.history.replaceState(null, null, newUrl);

        } 

        if (window.location.search.indexOf('msg=wbAccessError') > -1) {
          $.notify({
             icon: "",
             message: "You are authorized to access workbook. Please contact Administrator."
           },{
             type: "danger",
             timer: 4000,
             placement: {
                 from: 'top',
                 align: 'center'
             }
           });

           var currrentUrl =  window.location.href;
           var newUrl =  currrentUrl.split("?")[0];           
           window.history.replaceState(null, null, newUrl);

     } 
});