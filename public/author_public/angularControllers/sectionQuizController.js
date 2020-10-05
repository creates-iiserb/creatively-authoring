var app = angular.module('secQuizApp', ['ngTagsInput']);

app.controller('secQuizController',function($scope,$http,$timeout){
    $("#LiBasket").show();
    //-----------------------get workbook----------------------------------------
    $scope.quizInitFunc = function(basketCount){      
        //console.log(basketCount)
        var basketCount = JSON.parse(basketCount);
        $scope.basket = basketCount;
    }
});