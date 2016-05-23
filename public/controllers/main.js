'use strict';
/*
* @description: 
* #main
* 
  Main controller
*/
var fileAPI = function ($http) {

	var apiBaseUrl = '/api/files';
	var fileFactory = {};

	fileFactory.getFileContent = function(path) {

		return $http({
			url: apiBaseUrl + '/getContent',
			method: "GET",
			params: {path: path}
		});
	};

	return fileFactory;
};

var mainCtrl = function ($scope, $http, $resource, fileAPI) {

	$scope.submitForm = function () {	

		$('#histogram').html('');

		if ($scope.pathForm.$valid) {

			$scope.showLoading = true;

			setTimeout(function() { //Just for fun, simulate server delay

				fileAPI.getFileContent($scope.pathForm.filePath.$modelValue)

				.then(

					  function (response) {

					  	$scope.showLoading = false;
			  			showChart(response.data);

					  }, function(error) {

					  	//log error
					  }
				);

			}, 1500);
		}
	    
	};
};

var showChart = function (data) {
	
	var margin =  {top: 20, right: 10, bottom: 20, left: 40};
    var selectorHeight = 40;
    var width = 900 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom - selectorHeight;
    var barWidth = 3;

    var numBars = Math.round(width/barWidth);

    var xscale = d3.scale.ordinal()
            .domain(data.slice(0,numBars).map(function (d) { 
            	return d[0]; 
            }))
            .rangeBands([0, width]),
        yscale = d3.scale.linear()
            .domain([0, d3.max(data, function (d) { 
            	return d[1]; 
            })])
            .range([height, 0]);

    var xAxis  = d3.svg.axis().scale(xscale).orient("bottom"),
        yAxis  = d3.svg.axis().scale(yscale).orient("left");

    var svg = d3.select("#histogram").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom + selectorHeight);

    var diagram = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    diagram.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);

    diagram.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    var bars = diagram.append("g");

    bars.selectAll("rect")
        .data(data.slice(0, numBars), function (d) {return d[0]; })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xscale(d[0]); })
        .attr("y", function (d) { return yscale(d[1]); })
        .attr("width", xscale.rangeBand())
        .attr("height", function (d) { return height - yscale(d[1]); });

    var displayed = d3.scale.quantize()
        .domain([0, width])
        .range(d3.range(data.length));
       
}



angular.module('maanaApp', 
	[		
	'ngRoute',
	'ngResource',
	'ngMessages'
	])	
	.factory('fileAPI', fileAPI)
	.controller('mainCtrl', mainCtrl);

