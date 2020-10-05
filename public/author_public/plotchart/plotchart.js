// function plotchart(url, div){
//     $.ajax({
//       url: url,
//       data: {},
//       dataType: 'json',
//       type: "post",
//       success: function(response) {
//         // alert("success");
//         (function() {
//         // console.log(response);
//             var d3 = Plotly.d3;
//             // var WIDTH_IN_PERCENT_OF_PARENT = 100,
//             // HEIGHT_IN_PERCENT_OF_PARENT = 100;

//             var gd3 = d3.select('#a0000z')
//            // .append('div')
//             .style({
//                 width:'100%'
//                 // height: '100%'
//             });
//             var nodes_to_resize = gd3[0]; //not sure why but the goods are within a nested array
//       window.onresize = function() {
//         for (var i = 0; i < nodes_to_resize.length; i++) {
//           Plotly.Plots.resize(nodes_to_resize[i]);
//         }
//       };
//           })();
//           Plotly.newPlot(div, response.plotdata, response.layout);
//       },
//       error: function(response) {
//         console.log(JSON.stringify(response));
//       }
//     });
// }

/// --------------------------------old function-----------------------------/////////////////////
function ytvideo(url,iframeid){
    $.ajax({ 
      url: url,
      data: {},
      dataType: 'json',
      type: "POST",
      success: function(response) {
        // alert("success");
        var src="https://www.youtube.com/embed/"+response.ytvid+"?autoplay=0&rel=0&iv_load_policy=3&showinfo=1&modestbranding=1";
        document.getElementById(iframeid).src=src;
        // console.log($(this).id);
      },
      error: function(response) {
        console.log(JSON.stringify(response));
      }
    });     
}