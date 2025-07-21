import React, { useEffect, useRef } from 'react';

const PlotsReview = ({ data, generatedChart, chartRecommendation, drawFunction  }) => {
  const plotContainerRef = useRef(null);
 
  useEffect(() => {
    if (plotContainerRef.current) {
      // Clear previous plot
      plotContainerRef.current.innerHTML = '';
      if (generatedChart && generatedChart.element) {
        plotContainerRef.current.appendChild(generatedChart.element);
      }
    }
  }, [generatedChart]); // Re-run effect when the generatedChart object changes

  if (!generatedChart) {
    return (
      <div style={{ textAlign: 'center', color: '#6b7280', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No chart selected or generated yet.</p>
      </div>
    );
  }

  if (generatedChart.error) {
    return (
      <div style={{ textAlign: 'center', color: 'red', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h3>Error Generating Chart</h3>
        <p>{generatedChart.error}</p>
        <p>Recommendation ID: {generatedChart.id}</p>
      </div>
    );
  }

  return (
    <div className="plots-review-container" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <h4>Plot for: {generatedChart.recommendation?.title || generatedChart.id}</h4>
      <div ref={plotContainerRef}>
        {/* Plot will be appended here by useEffect */}
      </div>

      {/* button to keep chart */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => {
            if (generatedChart && generatedChart.pngUrl) {
              // Call the draw function to add the chart to the document
              if (drawFunction && typeof drawFunction === 'function') {
                drawFunction(generatedChart.pngBlob, generatedChart.styles);
              } else {
                console.error('drawFunction is not a valid function');
              }
            } else {
              console.error('No chart to keep');
            }
          }}
        >
          Keep Chart
        </button>
      </div>

      {/* <pre style={{ textAlign: 'left', fontSize: '0.8em', color: '#555', marginTop: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
        <code>
          Recommendation Details: {JSON.stringify(generatedChart.recommendation, null, 2)}
          <br/>
          Applied Styles: {JSON.stringify(generatedChart.styles, null, 2)}
        </code>
      </pre> */}
    </div>
  );
};

export { PlotsReview };