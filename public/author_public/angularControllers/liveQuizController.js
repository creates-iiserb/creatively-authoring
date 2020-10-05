
var app  = angular.module('myapp',[]);



app.controller('myctrl',function($scope,$http,$timeout){

    $scope.loadQuestion = false;
    $scope.quizData = {
            "elements": [
                {
                    "object": {
                    "question": "<b> Addition of integers </b> <br> We would like to practice the addition of numbers in the form \n<p align=\"center\"><math><mstyle displaystyle=\"true\"><mrow><mi>c</mi><mo>=</mo><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></mrow></mstyle></math></p>\n What is value of \\(c\\) for \n<math><mstyle displaystyle=\"true\"><mrow><mi>a</mi><mo>=</mo><mn>12</mn></mrow></mstyle></math>\n and \n<math><mstyle displaystyle=\"true\"><mrow><mi>b</mi><mo>=</mo><mn>4</mn></mrow></mstyle></math>\n.",
                    "options": [
                        {
                        "Id": 1,
                        "statement": "<math><mstyle displaystyle=\"true\"><mn>16</mn></mstyle></math>"
                        },
                        {
                        "Id": 2,
                        "statement": "<math><mstyle displaystyle=\"true\"><mn>15</mn></mstyle></math>"
                        },
                        {
                        "Id": 3,
                        "statement": "<math><mstyle displaystyle=\"true\"><mn>17</mn></mstyle></math>"
                        },
                        {
                        "Id": 4,
                        "statement": "<math><mstyle displaystyle=\"true\"><mn>8</mn></mstyle></math>\n  "
                        }
                    ],
                    "explanation": "No explanation available.",
                    "hint": "No hint available."
                    },
                    "type": "mcq",
                    "ref": "00034"
                }
            
            ]
        }
        
    
    $scope.getTemplate = function(){
		var question = $scope.loadQuestion;		
		if(question){
			if(question.type=='mcq'){
				return "mcq1.html"
			}
		}
    }

    $scope.loadQuestionData = function(ind){
        $scope.loadQuestion = $scope.quizData.elements[ind];
    }
    

 
});



app.directive('math', function () {
    return {
        restrict: 'EA',
        scope: {
            math: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('math', function (value) {
				if (!value) return; 
				
                elem.html(value);               
                setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                 }, 0);
            });
        }
    };
});