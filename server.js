/*
* @description: node/express config
*/

var port = 3030;
//Node builtin functionality
var express = require('express');
var fs = require('fs');
var path = require('path');
var admZip = require('adm-zip');
var app = express();
var maana = maana || {};

maana.backend = (function () {

	var contents = '';
	var ext = '';

	readFile = function(parentPath, filePath) {

		ext = /(?:\.([^.]+))?$/.exec(filePath)[1];

		if (ext == "zip") {

			zip = new admZip(filePath);
			zip.extractAllTo(parentPath + '/zip/', true);
			walkPath(parentPath + '/zip/');	

		} else if (ext == "txt") {

			contents += fs.readFileSync(filePath, 'utf8');
		}
	},
	//Read files recursively
	walkPath = function(filePath) {	

		if (!fs.statSync(filePath).isDirectory()) {

			readFile(filePath, filePath);
			return;
		} else {

			var files = fs.readdirSync(filePath);

			for(var name in files) {			

				if(files.hasOwnProperty(name)){	

					var subPath = path.join(filePath, files[name]);

					if (fs.statSync(subPath).isDirectory()) {

						walkPath(subPath);
					} else {		
						//check for zip file extension
					    readFile(filePath, subPath);
					}					
				}
			}
		}	
	},
	parseIntoArray = function(content) {

		var data = [];
		content = content.sort();
		var c = 1;
		
		for(var i = 0; i < content.length; i++) {
							
			if(i > 0) {

				if (content[i] == content[i - 1]) {

					c++; 

				} else {

					data.push([content[i - 1].trim() , c]);									
					c = 1;
				}
			} 						
		}		
		return data;
	},
	getContent = function(req, res, next) {

		contents = '';		
		walkPath(req.param('path'));
		var jsonObj = parseIntoArray(contents.split('\n'));
		res.send(JSON.stringify(jsonObj));		

	};
	return {		

		getContent: getContent

	}
})();

//API to access file system
app.get('/api/files/getContent', maana.backend.getContent);
app.use(express.static(__dirname + '/public'));
app.listen(port);

console.log('Server running at http://localhost:' + port);