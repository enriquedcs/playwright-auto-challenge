/**
 * Author: Enrique A Decoss
 * File: excelReader.js
 * Description: Utility module for reading Excel (.xlsx) files containg challenge data.
 *              Parses spredsheet data and converts it to JSON format for automation procesing.
 */

const XLSX = require('xlsx'); 

/**
 * Reads the Excel file and returns an array of JSON objects.
 */
function readData(filePath) {
    // 1. Read the workbook from the file path
    const workbook = XLSX.readFile(filePath);
    
    // 2. Get the name of the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 3. Convert the worksheet data into an array of JSON objects
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data; 
}
module.exports = { readData };