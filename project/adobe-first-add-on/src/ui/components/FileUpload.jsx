import React, { useRef, useState, useEffect, useCallback} from "react";
import { Dropzone } from "@swc-react/dropzone";
import { Button } from "@swc-react/button";
import { Link } from "@swc-react/link";
import { ProgressCircle } from "@swc-react/progress-circle";

// fontawesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faXmark } from "@fortawesome/free-solid-svg-icons";


//import the fileReader component
import { readAndParseFiles } from "../utils/ReadAndParse.js";
import { CustomDialog } from "./CustomDialog.jsx";
import { ChartsOption } from "./ChartsOption.jsx";



// import llm responses
import { Test1 } from "../utils/GetLLM.js"; 





const FileUpload = ({ drawFunction }) => {
   const fileInputRef = useRef(null);
   const [selectedFiles, setSelectedFiles] = useState([]);

   const [parsedData, setParsedData] = useState([]);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);


   // useState for the dialog modal
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [dialogData, setDialogData] = useState(null);

   // Function to handle files, whether dropped or selected
   const handleFileSelection = useCallback(async (files) => {
      if (files && files.length > 0) {
         setSelectedFiles(files);
         // Read and parse the files
         try{
            setLoading(true);
            setError(null);
            const pD = await readAndParseFiles(files);
            setParsedData(pD); // Update state with parsed data
         }
         catch(error){
            console.error("Error reading files:", error);
            setError("Failed to read files. Please try again.");
            return;
         }
         finally {
            setLoading(false);
         }
      }
   }, [setSelectedFiles, readAndParseFiles]);


   const getLLMResponse = async () => {
      if(parsedData.length === 0) {
         setError("No data to analyze. Please upload a file first.");
         return;
      }
      try {
         setLoading(true);
         setError(null);
         await Promise.all(
            parsedData.map(async (fileData) => {
               const response = await Test1(fileData.data);
               setParsedData(prevData =>{
                  return prevData.map(data => {
                     if (data.fileName === fileData.fileName) {
                        return { ...data, llmResponse: response };
                     }
                     return data;
                  });
               })
               
            })
         );
      } catch (error) {
         console.error("Error getting LLM response:", error);
         setError("Failed to get LLM response. Please try again.");
      }
      finally {
         setLoading(false);
      }
   };

   // Handles files dropped onto the Dropzone
   const handleDrop = useCallback((event) => {
      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation();
      
      // Get files from the drop event
      const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
      handleFileSelection(files);
   }, [handleFileSelection]);

   // Handles files selected via the hidden input
   const handleFileInputChange = useCallback((event) => {
      const files = Array.from(event.target.files);
      handleFileSelection(files);
   }, [handleFileSelection]);

   // This function is called when the 'click to select files' link is clicked
   const handleClickToSelect = useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
      fileInputRef.current?.click();
   }, []);

   const handleRemoveFile = useCallback((fileToRemove) => {
      setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileToRemove.name));
      setParsedData(prevData => prevData.filter(fileData => fileData.fileName !== fileToRemove.name));
   }, []);


   const handleModalClose = useCallback(() => {
      setIsDialogOpen(false);
      setDialogData(null); // Optional: clear the data too
   }, []);


   return (
      <div className="w-100 d-flex flex-column justify-content-center text-center mb-4">

         <div className="w-100 mx-auto">
            <Dropzone
               onDrop={handleDrop}
               style={{
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '20px',
                  minHeight: '120px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  maxWidth: '100%',
                  overflow: 'hidden'
               }}
               className="dropzone-container"
            >
               <p style={{
                  margin: 0,
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  wordWrap: 'break-word'
               }}>
                  Drag and drop your CSV or XLSX files here, or{' '}
                  <Link onClick={handleClickToSelect} style={{ fontSize: 'inherit', cursor: 'pointer' }}>
                     click to select files
                  </Link>
               </p>

               {/* The hidden file input */}
               <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  multiple
                  accept=".csv,.xlsx"
               />
            </Dropzone>
         </div>
                  
         {/* Error Display */}
         {error && (
            <div 
               style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  border: '1px solid #f5c6cb'
               }}
            >
               {error}
            </div>
         )}

         {/* Loading Indicator */}
         {loading && (
            <div style={{ marginTop: '10px' }}>
               <ProgressCircle size="small" />
               <p style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  {parsedData.length > 0 ? 'Analyzing data...' : 'Processing files...'}
               </p>
            </div>
         )}


         <div>
            {selectedFiles.length > 0 && (
               <div 
                  className="d-flex flex-column align-items-start text-align-left mb-3 mt-3" 
                  style={{
                     fontSize: '15px',
                     textAlign: 'left',      
                     width: '100%'           
                  }}
               >
                  <h5>Selected Files:</h5>
                  <ul className="list-unstyled">
                     {selectedFiles.map((file, index) => (
                        <li key={index} className="text-truncate" style={{ maxWidth: '280px', marginBottom: '5px' }}>
                           <span>
                              <FontAwesomeIcon
                                 icon={file.name.endsWith('.csv') ? faFileCsv : faFileExcel}
                                 style={{ marginRight: '8px', color: file.name.endsWith('.csv') ? '#28a745' : '#17a2b8' }}
                              />
                              {index + 1}. {file.name}
                           </span>
                           <FontAwesomeIcon
                              icon={faXmark}
                              onClick={() => handleRemoveFile(file)}
                              style={{ 
                                 cursor: 'pointer', 
                                 color: '#dc3545', 
                                 backgroundColor: '#f7eeeeff', 
                                 marginLeft: '15px',
                                 padding: '2px',
                                 borderRadius: '2px'
                              }}
                           />
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>

         {/* Display Parsed Data Summary */}
         {parsedData.length > 0 && !loading && (
            <div 
               style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  border: '1px solid #c3e6cb',
                  textAlign: 'left'
               }}
            >
               <h6>Data Successfully Parsed:</h6>
               {parsedData.map((fileData, index) => (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '5px' }}>
                     <strong>{fileData.fileName}</strong>: {fileData.recordCount} records, 
                     {fileData.headers ? ` ${fileData.headers.length} columns` : ''}
                     {fileData.llmResponse && <span style={{ color: '#28a745' }}> ✓ Analyzed</span>}
                  </div>
               ))}
            </div>
         )}

         <Button
            size="m"
            style={{
               marginTop: '16px',
               width: '100%',
               borderRadius: '8px',
               backgroundColor: (loading || parsedData.length === 0) ? '#ccc' : '#6366f1',
               color: 'white', 
               padding: '6px 20px',
               cursor: (loading || parsedData.length === 0) ? 'not-allowed' : 'pointer'
            }}
            onClick={() => getLLMResponse()}
            disabled={loading || parsedData.length === 0}
         >
            {loading ? 'Analyzing...' : 'Get Chart Recommendations'}
         </Button>

         {/* Display LLM Responses */}
         {parsedData.some(file => file.llmResponse) && (
            <div 
               style={{
                  marginTop: '20px',
                  textAlign: 'left',
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
               }}
            >
               <h4>Chart Recommendations and Insights:</h4>
               {parsedData.map((fileData, index) => {
                  if (!fileData.llmResponse) {
                     return (
                        <div key={index} style={{ marginBottom: '5px', backgroundColor: '#e9ecef', padding: '10px', borderRadius: '8px' }}>
                           <strong>{fileData.fileName}:</strong> No recommendations available.
                        </div>
                     );
                  }
                  return (
                     <div key={index} style={{ marginBottom: '10px', backgroundColor: '#e9ecef',  borderRadius: '8px' , width: '100%', padding: '5px',}}>

                        <div className="d-flex justify-content-between align-items-center">
                           <strong><h6 style={{ color: '#495057' }}>{fileData.fileName}</h6></strong>
                           <span>
                              <Button
                                 size="s"
                                 onClick={() => {
                                    setIsDialogOpen(true);
                                    setDialogData(fileData);
                                 }}
                                 style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                 }}
                              >
                                 Get Insights
                              </Button>
                           </span>
                        </div>

                        {/* lower body */}
                        <ChartsOption data={fileData} drawFunction={drawFunction} />
                     </div>
                  )
               })}
            </div>
         )}

         {/* Dialog component to show the insights */}
         {parsedData.length > 0 && (
            <CustomDialog 
               isOpen={isDialogOpen} 
               data={dialogData} 
               handleModalClose={handleModalClose} 
            />
         )}


         

      </div>
   )
}

export default FileUpload;