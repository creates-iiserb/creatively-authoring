$(document).ready(function () {

    $(document).on("click", "a.sampleclick" , function() {
        $(".sampleclick").removeClass("btn-fill");
        $(this).addClass("btn-fill");
    });

    $('[rel="tooltip"]').tooltip({ trigger: "hover" });

    // $("body").on("click", "#secInst", function () {
    //     // var sectnInst = $(this).attr("data-item");
    //     $('#quesPreview ').hide();
    //     $('#instPreviewDiv ').show();
    //     // $('#instPreview ').html(sectnInst);
    // });

    // $("body").on("click", "#btnbQuizInst", function () {
    //     var quizInst = $(this).attr("data-item");
    //     $('#quesPreview ').hide();
    //     $('#instPreviewDiv ').show();
    //     $('#instPreview ').html(quizInst);
    // });


});
