var XLSX = require('xlsx');


function xlsx2json(filename, sheetname)
{
	var wb = XLSX.readFile(filename);
	try {
    	var worksheet = wb.Sheets[sheetname];
    }catch (err) {
        console.log("ERROR:" + err);
        return null;
    }

	//console.dir(wb);
	var sheetData = XLSX.utils.sheet_to_json(worksheet, {header:1});
	console.log(sheetData);

	return sheetData;
}

exports.xlsx2json = xlsx2json;

//xlsx2json('textList.xlsx', 'list');