var app = angular.module('adminAnalyticsApp', ['ui.bootstrap', 'ui.utils']);

app.controller('adminAnalyticsContoller', function ($scope, $http, $timeout, $compile) {
    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');

    $scope.initData = function (adminGlobal) {

        var adminGlobal = JSON.parse(adminGlobal);
        $scope.adminGlobal = adminGlobal;

        $('.ld').hide();
        $('.wrapper').removeClass('ld-over-full-inverse running');
        $("#mainPanelDiv").show();
    }

    $scope.fetchReport = function () {
        var report = document.getElementById("report").value;
        var udata = {};
        udata["module"] = report;
        $scope.reset()
        $http.post("/author_adminAnalyticsData", udata).then(function (callback) {
            if (callback.data.status === "success") {
                $scope.isGenetated = true;

                $scope.generateReport(callback.data)
            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    $scope.reset = function () {
        $scope.isGenetated = false;
        document.getElementById("reportDiv").innerHTML = "";
    }

    $scope.generateReport = function (dta) {
        console.log(dta);
        let head = `<h4>${dta["heading"]}</h4><p class="text-muted">Generated on ${dta["generatedOn"]}</p><hr>`
        $("#reportDiv").append(head)

        let showPlot = {
            "pie": (data, cssid) => {
                var chart = am4core.create(cssid, am4charts.PieChart);
                // Add data
                chart.data = data;
                // Set inner radius
                chart.innerRadius = am4core.percent(50);
                // Add and configure Series
                var pieSeries = chart.series.push(new am4charts.PieSeries());
                pieSeries.dataFields.value = "value";
                pieSeries.dataFields.category = "category";
                pieSeries.slices.template.stroke = am4core.color("#fff");
                pieSeries.slices.template.strokeWidth = 2;
                pieSeries.slices.template.strokeOpacity = 1;
                // This creates initial animation
                pieSeries.hiddenState.properties.opacity = 1;
                pieSeries.hiddenState.properties.endAngle = -90;
                pieSeries.hiddenState.properties.startAngle = -90;
            },
            "histogram": (data, cssid) => {
                var trace = { x: data, type: 'histogram', };
                var data = [trace];
                Plotly.newPlot(cssid, data);
            },
            "barchart": (data, cssid) => {
                var chart1 = am4core.create(cssid, am4charts.XYChart);
                // Add data
                chart1.data = data
                // Create axes
                var categoryAxis = chart1.xAxes.push(new am4charts.CategoryAxis());
                categoryAxis.dataFields.category = "category";
                categoryAxis.renderer.grid.template.location = 0;
                categoryAxis.renderer.minGridDistance = 30;
                var valueAxis = chart1.yAxes.push(new am4charts.ValueAxis());
                // Create series
                var series = chart1.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = "value";
                series.dataFields.categoryX = "category";
                series.name = "Visits";
                series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
                series.columns.template.fillOpacity = .8;
                var columnTemplate = series.columns.template;
                columnTemplate.strokeWidth = 2;
                columnTemplate.strokeOpacity = 1;
            },
            "heatmap": (data1, cssid) => {
                let getHeatMapDataFormat = (Data) => {
                    //console.log("inside heratmaps")
                   // console.log(Data)
                    HeatmapData = [];
                    (Month = {
                      0: "Jan",
                      1: "Feb",
                      2: "Mar",
                      3: "Apr",
                      4: "May",
                      5: "Jun",
                      6: "Jul",
                      7: "Aug",
                      8: "Sep",
                      9: "Oct",
                      10: "Nov",
                      11: "Dec",
                    }),
                      (Week = {
                        0: "Sun",
                        1: "Mon",
                        2: "Tue",
                        3: "Wed",
                        4: "Thu",
                        5: "Fri",
                        6: "Sat",
                      });
                  
                    Object.keys(Data).forEach((dt) => {
                      let Ob = {
                        Date: "",
                        Month: "",
                        Week: "",
                        Year:"",
                        Value: 0,
                      };
                      console.log(typeof dt)
                      Ob.Value = Data[dt];
                      Ob.Date = dt;
                     // console.log(dt)
                      let d1 = new Date(dt);
                    //  console.log(d1);
                    let year = d1.getFullYear()
                    console.log(year)
                      Ob.Month = Month[d1.getMonth()]+year
                      Ob.Week = Week[d1.getDay()];
                      HeatmapData.push(Ob);
                    });
                 //   console.log(HeatmapData)


                 sortedDays  = HeatmapData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
                 console.log(sortedDays)
                 return sortedDays;
                }
                // console.log(data1)
                let data = getHeatMapDataFormat(data1);
                var chart = am4core.create(cssid, am4charts.XYChart);
                chart.maskBullets = false;

                var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
                var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

                xAxis.dataFields.category = "Month";
                yAxis.dataFields.category = "Week";

                xAxis.renderer.grid.template.disabled = true;
                xAxis.renderer.minGridDistance = 30;

                yAxis.renderer.grid.template.disabled = true;
                yAxis.renderer.inversed = true;
                yAxis.renderer.minGridDistance = 30;

                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = "Month";
                series.dataFields.categoryY = "Week";
                series.dataFields.value = "Value";
                series.sequencedInterpolation = true;
                series.defaultState.transitionDuration = 3000;

                var bgColor = new am4core.InterfaceColorSet().getFor("background");

                var columnTemplate = series.columns.template;
                columnTemplate.strokeWidth = 1;
                columnTemplate.strokeOpacity = 0.2;
                columnTemplate.stroke = bgColor;
                columnTemplate.tooltipText =
                    "{Month}, {Date}: {Value.formatNumber('#.')}";
                columnTemplate.width = am4core.percent(100);
                columnTemplate.height = am4core.percent(100);

                series.heatRules.push({
                    target: columnTemplate,
                    property: "fill",
                    min: am4core.color("#F5DBCB"),
                    max: am4core.color("#ED7B84"), 
                });

                // heat legend
                var heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
                heatLegend.width = am4core.percent(100);
                heatLegend.series = series;
                heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
                heatLegend.valueAxis.renderer.minGridDistance = 30;
                heatLegend.minColor = am4core.color("#F5DBCB");
                heatLegend.maxColor = am4core.color("#ED7B84");

                // heat legend behavior
                series.columns.template.events.on("over", function (event) {
                    handleHover(event.target);
                });

                series.columns.template.events.on("hit", function (event) {
                    handleHover(event.target);
                });

                function handleHover(column) {
                    if (!isNaN(column.dataItem.value)) {
                        heatLegend.valueAxis.showTooltipAt(column.dataItem.value);
                    } else {
                        heatLegend.valueAxis.hideTooltip();
                    }
                }

                series.columns.template.events.on("out", function (event) {
                    heatLegend.valueAxis.hideTooltip();
                });
                chart.data = data;
            }
        }

        dta['data'].map((item, index) => {
            let plotName = "plot-" + index
            $("#reportDiv").append(`<h5>${item.title}</h5>`)
            let newele = `<div class="chart${item["plotType"]}" id="${plotName}"></div>`
            $("#reportDiv").append(newele)
            showPlot[item["plotType"]](item['data'], plotName)
            $("#reportDiv").append(`<hr>`)
        })
    }
}); 