/**
 * Author: Enrique A Decoss
 * File: excelReader.js
 * Description: Utility module for reading Excel (.xlsx) files containg challenge data.
 *              Parses spreadsheet data and converts it to JSON format for automation procesing.
 */

const XLSX = require('xlsx'); 

/**
 * Reads the Excel file and returns an array of JSON object.
 */
function readData(filePath) {
    //Read the workbook from the file path
    const workbook = XLSX.readFile(filePath);
    
    //Get the name of the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    //Convert the spreadsheet data into an array of JSON objects
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data; 
}
module.exports = { readData };