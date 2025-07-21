// PlotStyleController.jsx
import React, { useState, useEffect } from 'react';

const PlotStyleController = ({ plotRecommendation, onStyleChange }) => {
  // Default styles based on plot type
  const getDefaultStyles = (plotType) => {
    const baseStyles = {
      width: 800,
      height: 400,
      margins: { top: 40, right: 40, bottom: 80, left: 80 },
      showGrid: true,
      showLegend: true,
      showTooltip: true
    };

    const plotSpecificStyles = {
      bar: {
        ...baseStyles,
        colorScheme: 'category10',
        fillOpacity: 0.8,
        strokeWidth: 1,
        barPadding: 0.1
      },
      line: {
        ...baseStyles,
        colorScheme: 'category10',
        strokeWidth: 3,
        curveType: 'catmull-rom',
        showPoints: true,
        pointRadius: 4,
        pointStroke: 'white',
        pointStrokeWidth: 2
      },
      scatter: {
        ...baseStyles,
        colorScheme: 'viridis',
        pointRadius: 5,
        fillOpacity: 0.7,
        strokeWidth: 1,
        pointShape: 'circle'
      },
      histogram: {
        ...baseStyles,
        colorScheme: 'blues',
        fillOpacity: 0.7,
        strokeWidth: 1,
        bins: 20
      },
      area: {
        ...baseStyles,
        colorScheme: 'blues',
        fillOpacity: 0.4,
        strokeWidth: 2,
        curveType: 'basis',
        showLine: true
      },
      heatmap: {
        ...baseStyles,
        colorScheme: 'viridis',
        cellPadding: 0.05,
        showValues: false
      },
      box: {
        ...baseStyles,
        colorScheme: 'set2',
        fillOpacity: 0.7,
        strokeWidth: 1,
        showOutliers: true
      },
      pie: {
        ...baseStyles,
        height: 500,
        colorScheme: 'category10',
        showLabels: true,
        labelType: 'percentage',
        innerRadius: 0
      }
    };

    return plotSpecificStyles[plotType] || baseStyles;
  };

  const [styles, setStyles] = useState(() => getDefaultStyles(plotRecommendation.plotType));

  // Update styles when plot type changes
  useEffect(() => {
    const newStyles = getDefaultStyles(plotRecommendation.plotType);
    setStyles(newStyles);
    onStyleChange(newStyles);
  }, [plotRecommendation.plotType]);

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onStyleChange(newStyles);
  };

  const handleMarginChange = (side, value) => {
    const newStyles = { 
      ...styles, 
      margins: { ...styles.margins, [side]: parseInt(value) || 0 }
    };
    setStyles(newStyles);
    onStyleChange(newStyles);
  };

  // Color schemes by category
  const colorSchemes = {
    categorical: [
      { value: 'category10', label: 'Category 10', description: 'Standard 10 colors' },
      { value: 'observable10', label: 'Observable 10', description: 'Observable palette' },
      { value: 'tableau10', label: 'Tableau 10', description: 'Tableau colors' },
      { value: 'set1', label: 'Set 1', description: 'ColorBrewer Set1' },
      { value: 'set2', label: 'Set 2', description: 'ColorBrewer Set2' },
      { value: 'dark2', label: 'Dark 2', description: 'Dark color palette' }
    ],
    sequential: [
      { value: 'blues', label: 'Blues', description: 'Light to dark blue' },
      { value: 'greens', label: 'Greens', description: 'Light to dark green' },
      { value: 'reds', label: 'Reds', description: 'Light to dark red' },
      { value: 'viridis', label: 'Viridis', description: 'Purple-blue-green-yellow' },
      { value: 'plasma', label: 'Plasma', description: 'Purple-pink-yellow' },
      { value: 'magma', label: 'Magma', description: 'Black-purple-pink-white' },
      { value: 'cividis', label: 'Cividis', description: 'Colorblind-friendly' }
    ],
    diverging: [
      { value: 'rdbu', label: 'Red-Blue', description: 'Red to blue diverging' },
      { value: 'rdylbu', label: 'Red-Yellow-Blue', description: 'Red-yellow-blue' },
      { value: 'spectral', label: 'Spectral', description: 'Spectral colors' },
      { value: 'brbg', label: 'Brown-Blue-Green', description: 'Brown to blue-green' }
    ]
  };

  const curveTypes = [
    { value: 'linear', label: 'Linear', description: 'Straight lines' },
    { value: 'basis', label: 'Basis', description: 'Smooth B-spline' },
    { value: 'catmull-rom', label: 'Catmull-Rom', description: 'Smooth through points' },
    { value: 'step-after', label: 'Step After', description: 'Step function' },
    { value: 'step-before', label: 'Step Before', description: 'Step function (reverse)' },
    { value: 'cardinal', label: 'Cardinal', description: 'Cardinal spline' }
  ];

  const pointShapes = [
    { value: 'circle', label: '● Circle' },
    { value: 'square', label: '■ Square' },
    { value: 'diamond', label: '◆ Diamond' },
    { value: 'triangle', label: '▲ Triangle' },
    { value: 'cross', label: '✕ Cross' },
    { value: 'star', label: '★ Star' }
  ];

  // Get appropriate color schemes based on plot type and data mapping
  const getAvailableColorSchemes = () => {
    const plotType = plotRecommendation.plotType;
    const hasCategories = plotRecommendation.dataMapping.fill?.type === 'categorical';
    
    if (plotType === 'heatmap' || plotType === 'histogram') {
      return [...colorSchemes.sequential, ...colorSchemes.diverging];
    } else if (hasCategories) {
      return colorSchemes.categorical;
    } else {
      return [...colorSchemes.categorical, ...colorSchemes.sequential];
    }
  };

  const renderFormField = (label, children, description = '') => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: 'bold',
        color: '#495057' 
      }}>
        {label}
      </label>
      {children}
      {description && (
        <small style={{ color: '#6c757d', fontSize: '0.85em' }}>
          {description}
        </small>
      )}
    </div>
  );

  const inputStyle = {
    width: '100%',
    padding: '3px 6px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: 'white'
  };

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #dee2e6', 
      width : '100%',
    }}>
      <h4 style={{ 
        marginBottom: '20px', 
        color: '#495057',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
      }}>
        🎨 Customize: {plotRecommendation.title}
      </h4>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'left',
      }}>
        
        {/* Basic Dimensions */}
        <div className="w-75">
          <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>📏 Dimensions</h6>
          
          {renderFormField('Width (px)', 
            <input
              type="number"
              style={inputStyle}
              value={styles.width}
              onChange={(e) => handleStyleChange('width', parseInt(e.target.value))}
              min="300"
              max="1200"
            />
          )}

          {renderFormField('Height (px)',
            <input
              type="number"
              style={inputStyle}
              value={styles.height}
              onChange={(e) => handleStyleChange('height', parseInt(e.target.value))}
              min="200"
              max="800"
            />
          )}
        </div>

        {/* Color & Appearance */}
        <div>
          <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>🎨 Colors</h6>
          
          {renderFormField('Color Scheme',
            <select
              style={selectStyle}
              value={styles.colorScheme}
              onChange={(e) => handleStyleChange('colorScheme', e.target.value)}
            >
              {getAvailableColorSchemes().map(scheme => (
                <option key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </option>
              ))}
            </select>,
            getAvailableColorSchemes().find(s => s.value === styles.colorScheme)?.description
          )}

          {(plotRecommendation.plotType === 'bar' || 
            plotRecommendation.plotType === 'area' || 
            plotRecommendation.plotType === 'scatter' ||
            plotRecommendation.plotType === 'histogram') && (
            renderFormField('Fill Opacity',
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={styles.fillOpacity}
                onChange={(e) => handleStyleChange('fillOpacity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            )
          )}
        </div>

        {/* Line/Stroke Settings */}
        {(plotRecommendation.plotType === 'line' || 
            plotRecommendation.plotType === 'area' ||
            plotRecommendation.plotType === 'scatter' ||
            plotRecommendation.plotType === 'bar') && (
            <div>
                <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>✏️ Strokes</h6>
                
                {renderFormField('Stroke Width',
                <input
                    type="number"
                    style={inputStyle}
                    value={styles.strokeWidth}
                    onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
                    min="1"
                    max="10"
                />
                )}

                {(plotRecommendation.plotType === 'line' || plotRecommendation.plotType === 'area') && 
                renderFormField('Curve Type',
                    <select
                    style={selectStyle}
                    value={styles.curveType}
                    onChange={(e) => handleStyleChange('curveType', e.target.value)}
                    >
                    {curveTypes.map(curve => (
                        <option key={curve.value} value={curve.value}>
                        {curve.label}
                        </option>
                    ))}
                    </select>,
                    curveTypes.find(c => c.value === styles.curveType)?.description
                )
                }
            </div>
        )} 

        {/* Point Settings */}
        {(plotRecommendation.plotType === 'scatter' || 
            (plotRecommendation.plotType === 'line' && styles.showPoints)) && (
            <div>
                <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>● Points</h6>
                
                {renderFormField('Point Radius',
                <input
                    type="number"
                    style={inputStyle}
                    value={styles.pointRadius}
                    onChange={(e) => handleStyleChange('pointRadius', parseInt(e.target.value))}
                    min="1"
                    max="15"
                />
                )}

                {plotRecommendation.plotType === 'scatter' && 
                renderFormField('Point Shape',
                    <select
                    style={selectStyle}
                    value={styles.pointShape}
                    onChange={(e) => handleStyleChange('pointShape', e.target.value)}
                    >
                    {pointShapes.map(shape => (
                        <option key={shape.value} value={shape.value}>
                        {shape.label}
                        </option>
                    ))}
                    </select>
                )
                }
            </div>
        )}

        {/* Special Settings */}
        <div>
          
          {plotRecommendation.plotType === 'histogram' && (
            renderFormField('Number of Bins',
              <input
                type="number"
                style={inputStyle}
                value={styles.bins}
                onChange={(e) => handleStyleChange('bins', parseInt(e.target.value))}
                min="5"
                max="50"
              />
            )
          )}

          {plotRecommendation.plotType === 'pie' && (
            <>
              {renderFormField('Inner Radius',
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styles.innerRadius}
                  onChange={(e) => handleStyleChange('innerRadius', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              )}
              
              {renderFormField('Label Type',
                <select
                  style={selectStyle}
                  value={styles.labelType}
                  onChange={(e) => handleStyleChange('labelType', e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="value">Actual Values</option>
                  <option value="label">Category Labels</option>
                  <option value="none">No Labels</option>
                </select>
              )}
            </>
          )}

          {plotRecommendation.plotType === 'line' && (
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={styles.showPoints}
                  onChange={(e) => handleStyleChange('showPoints', e.target.checked)}
                />
                Show Points on Lines
              </label>
            </div>
          )}
        </div>

        {/* Display Options */}
        <div>
          <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>👁️ Display</h6>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={styles.showGrid}
                onChange={(e) => handleStyleChange('showGrid', e.target.checked)}
              />
              Show Grid Lines
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={styles.showLegend}
                onChange={(e) => handleStyleChange('showLegend', e.target.checked)}
              />
              Show Legend
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={styles.showTooltip}
                onChange={(e) => handleStyleChange('showTooltip', e.target.checked)}
              />
              Show Tooltips
            </label>
          </div>
        </div>

        {/* Margins */}
        <div>
          <h6 style={{ color: '#6c757d', marginBottom: '15px' }}>📐 Margins</h6>
          
          {renderFormField('Top',
            <input
              type="number"
              style={inputStyle}
              value={styles.margins.top}
              onChange={(e) => handleMarginChange('top', e.target.value)}
              min="0"
              max="100"
            />
          )}

          {renderFormField('Bottom',
            <input
              type="number"
              style={inputStyle}
              value={styles.margins.bottom}
              onChange={(e) => handleMarginChange('bottom', e.target.value)}
              min="20"
              max="150"
            />
          )}

          {renderFormField('Left',
            <input
              type="number"
              style={inputStyle}
              value={styles.margins.left}
              onChange={(e) => handleMarginChange('left', e.target.value)}
              min="20"
              max="150"
            />
          )}

          {renderFormField('Right',
            <input
              type="number"
              style={inputStyle}
              value={styles.margins.right}
              onChange={(e) => handleMarginChange('right', e.target.value)}
              min="20"
              max="150"
            />
          )}
        </div>
      </div>

      {/* Preview of current settings */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '0.9em'
      }}>
        <strong>Current Settings Summary:</strong>
        <br />
        📏 {styles.width}×{styles.height}px | 
        🎨 {styles.colorScheme} | 
        ✏️ Stroke: {styles.strokeWidth}px
        {plotRecommendation.plotType === 'line' && ` | 📈 ${styles.curveType}`}
        {(plotRecommendation.plotType === 'scatter' || styles.showPoints) && ` | ● ${styles.pointRadius}px`}
      </div>
    </div>
  );
};

export default PlotStyleController;