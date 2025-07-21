import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@swc-react/button';
import { ChartCard } from './ChartCard';
import { PlotsReview } from './PlotsReview.jsx';
import { generateChart, validateInputs } from '../utils/plotGenerator';

// Function to convert the SVG to a PNG blob
function svgToImageBlob(svgElement, extraStyles = '') {
  return new Promise((resolve, reject) => {
    try {
      if (!svgElement) {
        throw new Error('No SVG chart found');
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true);

      // Get SVG dimensions (default to 800x400 per your console output)
      const width = parseFloat(svgElement.getAttribute('width')) || 800;
      const height = parseFloat(svgElement.getAttribute('height')) || 400;
      svgClone.setAttribute('width', width);
      svgClone.setAttribute('height', height);

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgClone);

      // Inject extra styles if provided (ensure it's a string)
      if (typeof extraStyles === 'string' && extraStyles) {
        svgString = svgString.replace('<svg', `<svg><style>${extraStyles}</style>`);
      }

      // Create a blob from the SVG string
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      // Create an image to load the SVG
      const img = new Image();
      img.onload = () => {
        try {
          // Create a canvas with SVG dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get 2D canvas context');
          }

          // Draw the SVG image onto the canvas
          ctx.fillStyle = 'white'; // Ensure background for transparent SVGs
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to PNG blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url); // Clean up SVG blob URL
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create image blob'));
              }
            },
            'image/png',
            1.0
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

const ChartsOption = ({ data, drawFunction }) => {
  const [activeTab, setActiveTab] = useState('univariate');
  const [selectedChart, setSelectedChart] = useState(null);
  const [chartStyles, setChartStyles] = useState({ width: 800,
      height: 400,
      margins: { top: 40, right: 40, bottom: 80, left: 80 },
      showGrid: true,
      showTooltip: true, 
      autoLegend: true,
      forceLegend: false,
  });
  const [generatedCharts, setGeneratedCharts] = useState([]);
  const [imageError, setImageError] = useState(null); // Track image rendering errors

  const resData = data?.llmResponse || {};
  const plotRecommendations = resData.plotRecommendations || [];

  // Memoize filtered recommendations
  const univariateCharts = useMemo(
    () => plotRecommendations.filter((chart) => chart.category === 'univariate'),
    [plotRecommendations]
  );
  const bivariateCharts = useMemo(
    () => plotRecommendations.filter((chart) => chart.category === 'bivariate'),
    [plotRecommendations]
  );
  const multivariateCharts = useMemo(
    () => plotRecommendations.filter((chart) => chart.category === 'multivariate'),
    [plotRecommendations]
  );

  // Memoize selected chart recommendation
  const selectedChartRecommendation = useMemo(
    () => plotRecommendations.find((chart) => chart.id === selectedChart),
    [selectedChart, plotRecommendations]
  );

  // Memoize current generated chart
  const currentGeneratedChart = useMemo(
    () => generatedCharts.find((chart) => chart.id === selectedChart),
    [selectedChart, generatedCharts]
  );

  // Clean up blob URLs when selected chart changes or component unmounts
  useEffect(() => {
    return () => {
      generatedCharts.forEach((chart) => {
        if (chart.pngUrl) {
          URL.revokeObjectURL(chart.pngUrl);
        }
      });
      setGeneratedCharts([]); // Clear charts to prevent stale URLs
    };
  }, [selectedChart]); // Run cleanup when selectedChart changes

  const handleGenerateChart = useCallback(
    async (chartRecommendation, styles = null) => {

    try {
      const csvData = data.data || [];
      if (!csvData || csvData.length === 0) {
        // console.error('No data available for chart generation');
        setImageError('No data available for chart generation');
        return;
      }

      // Use styles as a string (convert object to string if needed)
      // const chartSpecificStyles =
      //   typeof styles === 'string'
      //     ? styles
      //     : styles?.extraStyles || chartStyles[chartRecommendation.id]?.extraStyles || '';
      const chartSpecificStyles = styles || chartStyles[chartRecommendation.id] || {};

      const plotElement = generateChart(csvData, chartRecommendation, chartSpecificStyles);


      if (plotElement) {
        // Generate PNG blob
        const pngBlob = await svgToImageBlob(plotElement, chartSpecificStyles);
        const pngUrl = URL.createObjectURL(pngBlob);


        // Update generated charts with PNG URL
        setGeneratedCharts((prev) => {
          const filtered = prev.filter((chart) => chart.id !== chartRecommendation.id);
          return [
            ...filtered,
            {
              id: chartRecommendation.id,
              element: plotElement,
              pngBlob : pngBlob, // Store PNG blob
              pngUrl: pngUrl, // Store PNG URL
              recommendation: chartRecommendation,
              styles: chartSpecificStyles,
              timestamp: new Date().getTime(),
              category: chartRecommendation.category,
            },
          ];
        });

        setSelectedChart(chartRecommendation.id);
        setImageError(null); // Clear any previous errors

        // Optional: Trigger download for debugging
        // const link = document.createElement('a');
        // link.href = pngUrl;
        // link.download = `${chartRecommendation.id}.png`;
        // link.click();
        // Note: Don't revoke here; cleanup is handled in useEffect
        

      } else {
        console.error('Failed to generate plot element');
        setImageError('Failed to generate plot element');
      }
    } catch (error) {
      console.error('Error generating chart:', error);
      setImageError(error.message);
      setGeneratedCharts((prev) => {
        const filtered = prev.filter((chart) => chart.id !== chartRecommendation.id);
        return [
          ...filtered,
          {
            id: chartRecommendation.id,
            element: null,
            error: error.message,
            recommendation: chartRecommendation,
            styles: styles || '',
            timestamp: new Date().getTime(),
            category: chartRecommendation.category,
          },
        ];
      });
      setSelectedChart(chartRecommendation.id);
    }
  }, [data, chartStyles, drawFunction, setGeneratedCharts, setSelectedChart]);

  const handleStyleChange = useCallback((chartId, styles) => {
    setChartStyles((prev) => ({
      ...prev,
      [chartId]: styles,
    }));
    const existingChart = generatedCharts.find((chart) => chart.id === chartId);
    if (existingChart) {
      handleGenerateChart(existingChart.recommendation, styles);
    }
  }, [generatedCharts, handleGenerateChart]);

  return (
    <div className="w-100 d-flex flex-column justify-content-center text-center mb-4">
      {/* Tab Navigation */}
      <div className="w-100 d-flex-row" style={{ marginBottom: '15px' }}>
        <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #e5e7eb' }}>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'univariate' ? 'active' : ''}`}
              onClick={() => setActiveTab('univariate')}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'univariate' ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === 'univariate' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
              }}
            >
              Univariate ({univariateCharts.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'bivariate' ? 'active' : ''}`}
              onClick={() => setActiveTab('bivariate')}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'bivariate' ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === 'bivariate' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
              }}
            >
              Bivariate ({bivariateCharts.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'multivariate' ? 'active' : ''}`}
              onClick={() => setActiveTab('multivariate')}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'multivariate' ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === 'multivariate' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
              }}
            >
              Multivariate ({multivariateCharts.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'univariate' && (
          <div>
            {univariateCharts.length > 0 ? (
              univariateCharts.map((chart, index) => (
                <React.Fragment key={`univariate-${chart.id || index}`}>
                  <ChartCard
                    chart={chart}
                    selectedChart={selectedChart}
                    setSelectedChart={setSelectedChart}
                    chartStyles={chartStyles}
                    handleStyleChange={handleStyleChange}
                    generateChart={handleGenerateChart}
                  />
                </React.Fragment>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                No univariate charts recommended for this dataset.
              </p>
            )}
          </div>
        )}
        {activeTab === 'bivariate' && (
          <div>
            {bivariateCharts.length > 0 ? (
              bivariateCharts.map((chart, index) => (
                <React.Fragment key={`bivariate-${chart.id || index}`}>
                  <ChartCard
                    chart={chart}
                    selectedChart={selectedChart}
                    setSelectedChart={setSelectedChart}
                    chartStyles={chartStyles}
                    handleStyleChange={handleStyleChange}
                    generateChart={handleGenerateChart}
                  />
                </React.Fragment>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                No bivariate charts recommended for this dataset.
              </p>
            )}
          </div>
        )}
        {activeTab === 'multivariate' && (
          <div>
            {multivariateCharts.length > 0 ? (
              multivariateCharts.map((chart, index) => (
                <React.Fragment key={`multivariate-${chart.id || index}`}>
                  <ChartCard
                    chart={chart}
                    selectedChart={selectedChart}
                    setSelectedChart={setSelectedChart}
                    chartStyles={chartStyles}
                    handleStyleChange={handleStyleChange}
                    generateChart={handleGenerateChart}
                  />
                </React.Fragment>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                No multivariate charts recommended for this dataset.
              </p>
            )}
          </div>
        )}

        {/* Display the selected generated chart */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h2>Generated Chart</h2>
          {imageError ? (
            <p style={{ textAlign: 'center', color: '#b91c1c' }}>
              Error: {imageError}
            </p>
          ) : currentGeneratedChart ? (
            <>
              <PlotsReview
                data={data}
                generatedChart={currentGeneratedChart}
                chartRecommendation={selectedChartRecommendation}
                drawFunction={drawFunction}
              />
              {/* {currentGeneratedChart.pngUrl ? (
                <img
                  src={currentGeneratedChart.pngUrl}
                  alt={selectedChartRecommendation?.title || 'Generated Chart'}
                  style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', display: 'block' }}
                  onError={(e) => {
                    console.error('Error rendering PNG image:', e);
                    setImageError('Failed to render chart image');
                  }}
                />
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                  Generating chart image...
                </p>
              )} */}
            </>
          ) : selectedChartRecommendation ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Click "Generate Chart" on the selected recommendation to see the plot.
            </p>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Select a chart recommendation from the tabs above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChartsOption };