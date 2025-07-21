// In this file we will read and parse the uploaded files
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Reads and parses an array of file objects (CSV or XLSX).
 * Returns a Promise that resolves with an array of parsed data objects.
 * Each object in the array will contain { fileName: string, data: any[], type: 'csv' | 'xlsx', headers: string[] }.
 * Rejects if no files are provided or if parsing fails.
 */
const readAndParseFiles = (files) => {
    if (!files || files.length === 0) {
        return Promise.reject(new Error("No files provided. Please upload a CSV/XLSX file."));
    }

    const parsingPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                Papa.parse(file, {
                    header: true, // Assumes the first row is headers
                    dynamicTyping: true, // Tries to convert strings to numbers/booleans
                    skipEmptyLines: true,
                    delimitersToGuess: [',', '\t', '|', ';'], // Handle different delimiters
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            console.warn("Papa Parse warnings for", fileName, results.errors);
                            // Don't reject for minor errors, just log them
                        }
                        
                        if (results.data.length === 0) {
                            reject(new Error(`CSV file ${fileName} appears to be empty or has no valid data rows.`));
                        } else {
                            // Get headers from the first row
                            const headers = results.meta.fields || [];
                            resolve({ 
                                fileName: fileName, 
                                data: results.data, 
                                type: 'csv',
                                headers: headers,
                                recordCount: results.data.length
                            });
                        }
                    },
                    error: (err) => {
                        console.error("Papa Parse overall error for", fileName, err);
                        reject(new Error(`Failed to parse CSV file ${fileName}: ${err.message}`));
                    }
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        
                        // Get the first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // Convert sheet to JSON with headers
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                            header: 1, // Get raw data first
                            raw: false, // Convert dates and numbers properly
                            dateNF: 'yyyy-mm-dd' // Standard date format
                        });

                        if (jsonData.length === 0) {
                            reject(new Error(`XLSX file ${fileName} appears to be empty.`));
                            return;
                        }

                        // First row contains headers
                        const headers = jsonData[0] || [];
                        const dataRows = jsonData.slice(1);

                        // Convert to object format like CSV
                        const objectData = dataRows.map(row => {
                            const obj = {};
                            headers.forEach((header, index) => {
                                // Clean up header names (remove whitespace)
                                const cleanHeader = String(header).trim();
                                obj[cleanHeader] = row[index] !== undefined ? row[index] : null;
                            });
                            return obj;
                        }).filter(obj => {
                            // Remove completely empty rows
                            return Object.values(obj).some(val => val !== null && val !== '' && val !== undefined);
                        });

                        resolve({ 
                            fileName: fileName, 
                            data: objectData, 
                            type: 'xlsx',
                            headers: headers.map(h => String(h).trim()),
                            recordCount: objectData.length
                        });
                    } catch (error) {
                        console.error("XLSX parsing error for", fileName, error);
                        reject(new Error(`Failed to parse XLSX file ${fileName}: ${error.message}`));
                    }
                };
                reader.onerror = (err) => {
                    console.error("FileReader error for XLSX", fileName, err);
                    reject(new Error(`Failed to read XLSX file ${fileName}: ${err.message}`));
                };
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error(`Unsupported file type: .${fileExtension} for file ${fileName}. Only CSV and XLSX files are supported.`));
            }
        });
    });

    // Use Promise.all to wait for all files to be parsed
    return Promise.all(parsingPromises);
};

export { readAndParseFiles };