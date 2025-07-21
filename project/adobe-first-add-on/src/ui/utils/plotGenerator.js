// src/utils/plotGenerator.js
import * as Plot from '@observablehq/plot';

// enum: ["bar", "line", "scatter", "histogram", "heatmap", "box", "area"] 
// Supported aggregations: ["count", "sum", "mean", "median", "min", "max", "first", "last"]

/**
 * Generates a chart based on the provided chart recommendation and styles.
 * @param {Array} data - The dataset array
 * @param {Object} chartRecommendation - Chart recommendation from LLM
 * @param {Object} styles - User-defined styles
 * @returns {SVGElement} - Observable Plot SVG element
 */
export function generateChart(data, chartRecommendation, styles = {}) {

    // Validate inputs first
    try {
        validateInputs(data, chartRecommendation);
    } catch (error) {
        return createErrorPlot(error.message, styles[chartRecommendation.id]);
    }

    // Extract data mapping from recommendation
    const { dataMapping, plotType } = chartRecommendation;
    
    // Default styles - uncommented and improved
    const defaultStyles = {
        width: 640,
        height: 400,
        margins: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        },
        color: 'steelblue',
        fillOpacity: 0.7,
        strokeWidth: 2,
        fontSize: 12,
        showGrid: true,
        showTooltip: true,
        pointRadius: 4,
        bins: 20
    };


    // Merge default styles with user styles
    const finalStyles = { ...defaultStyles, ...styles };

    // This list is helpful for defining color scale types
    const categoricalSchemes = [
        'category10', 'category20', 'category20b', 'category20c',
        'tableau10', 'tableau20', 'dark2', 'set1', 'set2', 'set3',
        'accent', 'paired', 'pastel1', 'pastel2'
        // 'spectral' is often diverging, so move it
    ];
    const sequentialSchemes = [
        'blues', 'greens', 'reds', 'viridis', 'plasma', 'magma', 'cividis', 'inferno', 'turbo'
    ];
    const divergingSchemes = [
        'rdbu', 'rdylbu', 'spectral', 'brbg', 'piyg', 'prgn', 'puor', 'rdgy', 'rdylgn'
    ];

    



    // Base plot configuration
    let plotConfig = {
        width: finalStyles.width,
        height: finalStyles.height,
        marginTop: finalStyles.marginTop || finalStyles.margins?.top,
        marginRight: finalStyles.marginRight || finalStyles.margins?.right,
        marginBottom: finalStyles.marginBottom || finalStyles.margins?.bottom,
        marginLeft: finalStyles.marginLeft || finalStyles.margins?.left,
        style: {
            fontSize: `${finalStyles.fontSize}px`,
            fontFamily: 'system-ui, sans-serif'
        },
        grid: finalStyles.showGrid,
        marks: [],
    };

    // if (finalStyles.colorScheme) {
    //     plotConfig.color = {
    //         scheme: finalStyles.colorScheme,
    //         legend: finalStyles.showLegend
    //     };
    // }

    // Only set color scheme at plot level if using categorical colors
    if (dataMapping.fill?.column && finalStyles.color === 'category10') {
        plotConfig.color = { scheme: 'category10' };
    }

    // Generate marks based on plot type
    switch (plotType.toLowerCase()) {
        case 'bar':
            plotConfig.marks = createBarMarks(data, dataMapping, finalStyles);
            break;
            
        case 'line':
            plotConfig.marks = createLineMarks(data, dataMapping, finalStyles);
            break;
            
        case 'scatter':
            plotConfig.marks = createScatterMarks(data, dataMapping, finalStyles);
            break;
            
        case 'histogram':
            plotConfig.marks = createHistogramMarks(data, dataMapping, finalStyles);
            break;
            
        case 'area':
            plotConfig.marks = createAreaMarks(data, dataMapping, finalStyles);
            break;
            
        case 'box':
            plotConfig.marks = createBoxMarks(data, dataMapping, finalStyles);
            break;
            
        case 'heatmap':
            plotConfig.marks = createHeatmapMarks(data, dataMapping, finalStyles);
            break;
            
        default:
            console.warn(`Unsupported plot type: ${plotType}`);
            plotConfig.marks = createScatterMarks(data, dataMapping, finalStyles);
    }

    // Add axes labels if provided
    if (dataMapping.x?.label) {
        plotConfig.x = { label: dataMapping.x.label };
    }
    if (dataMapping.y?.label) {
        plotConfig.y = { label: dataMapping.y.label };
    }

    // Create and return the plot
    try {
        return Plot.plot(plotConfig);
    } catch (error) {
        console.error('Error creating plot:', error);
        return createErrorPlot(error.message, finalStyles);
    }
}

// Helper functions for different chart types with aggregation support

function createBarMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Add baseline rule
    marks.push(Plot.ruleY([0]));
    
    // Determine bar orientation and aggregation needs
    const isVertical = dataMapping.y?.type === 'numerical' || dataMapping.y?.column;
    const xAggregation = dataMapping.x?.aggregation;
    const yAggregation = dataMapping.y?.aggregation;
    const needsGrouping = xAggregation || yAggregation || !dataMapping.y?.column;
    
    if (isVertical) {
        if (needsGrouping) {
            const aggregationType = yAggregation || 'count';
            const aggregationConfig = buildAggregationConfig('y', aggregationType, dataMapping.y?.column);
            
            marks.push(
                Plot.barY(data, 
                    Plot.groupX(
                        aggregationConfig,
                        {
                            x: dataMapping.x.column,
                            fill: dataMapping.fill?.column || styles.color,
                            fillOpacity: styles.fillOpacity,
                            tip: styles.showTooltip
                        }
                    )
                )
            );
        } else {
            marks.push(
                Plot.barY(data, {
                    x: dataMapping.x.column,
                    y: dataMapping.y.column,
                    fill: dataMapping.fill?.column || styles.color,
                    fillOpacity: styles.fillOpacity,
                    tip: styles.showTooltip
                })
            );
        }
    } else {
        if (needsGrouping) {
            const aggregationType = xAggregation || 'count';
            const aggregationConfig = buildAggregationConfig('x', aggregationType, dataMapping.x?.column);
            
            marks.push(
                Plot.barX(data,
                    Plot.groupY(
                        aggregationConfig,
                        {
                            y: dataMapping.x.column,
                            fill: dataMapping.fill?.column || styles.color,
                            fillOpacity: styles.fillOpacity,
                            tip: styles.showTooltip
                        }
                    )
                )
            );
        } else {
            marks.push(
                Plot.barX(data, {
                    y: dataMapping.x.column,
                    x: dataMapping.y.column,
                    fill: dataMapping.fill?.column || styles.color,
                    fillOpacity: styles.fillOpacity,
                    tip: styles.showTooltip
                })
            );
        }
    }
    
    return marks;
}

function createLineMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Add baseline rule if y starts from zero
    if (dataMapping.y?.type === 'numerical') {
        marks.push(Plot.ruleY([0]));
    }
    
    // Handle aggregation for line charts
    const needsAggregation = dataMapping.y?.aggregation || dataMapping.x?.aggregation;
    
    if (needsAggregation) {
        const yAggregation = dataMapping.y?.aggregation || 'mean';
        const aggregationConfig = buildAggregationConfig('y', yAggregation, dataMapping.y?.column);
        
        // Aggregated line
        marks.push(
            Plot.line(data, 
                Plot.groupX(
                    aggregationConfig,
                    {
                        x: dataMapping.x.column,
                        stroke: dataMapping.color?.column || styles.color,
                        strokeWidth: styles.strokeWidth,
                        curve: styles.curveType || 'linear',
                        tip: styles.showTooltip
                    }
                )
            )
        );
        
        // Add aggregated points if enabled
        if (styles.showPoints) {
            marks.push(
                Plot.dot(data,
                    Plot.groupX(
                        aggregationConfig,
                        {
                            x: dataMapping.x.column,
                            fill: dataMapping.color?.column || styles.color,
                            r: styles.pointRadius,
                            tip: styles.showTooltip
                        }
                    )
                )
            );
        }
    } else {
        // Non-aggregated line
        marks.push(
            Plot.line(data, {
                x: dataMapping.x.column,
                y: dataMapping.y.column,
                stroke: dataMapping.color?.column || styles.color,
                strokeWidth: styles.strokeWidth,
                curve: styles.curveType || 'linear',
                tip: styles.showTooltip
            })
        );
        
        // Add points if enabled
        if (styles.showPoints) {
            marks.push(
                Plot.dot(data, {
                    x: dataMapping.x.column,
                    y: dataMapping.y.column,
                    fill: dataMapping.color?.column || styles.color,
                    r: styles.pointRadius,
                    tip: styles.showTooltip
                })
            );
        }
    }
    
    return marks;
}

function createScatterMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Handle aggregation for scatter plots
    const needsAggregation = dataMapping.x?.aggregation || dataMapping.y?.aggregation || dataMapping.size?.aggregation;
    
    if (needsAggregation) {
        // Build aggregation config for multiple dimensions
        let aggregationConfig = {};
        
        if (dataMapping.y?.aggregation) {
            aggregationConfig = { ...aggregationConfig, ...buildAggregationConfig('y', dataMapping.y.aggregation, dataMapping.y.column) };
        }
        if (dataMapping.size?.aggregation) {
            aggregationConfig = { ...aggregationConfig, ...buildAggregationConfig('r', dataMapping.size.aggregation, dataMapping.size.column) };
        }
        
        // Determine grouping dimension
        const groupBy = dataMapping.x?.aggregation ? 'groupY' : 'groupX';
        const groupColumn = dataMapping.x?.aggregation ? dataMapping.y?.column : dataMapping.x?.column;
        
        if (groupBy === 'groupX') {
            marks.push(
                Plot.dot(data,
                    Plot.groupX(
                        aggregationConfig,
                        {
                            x: dataMapping.x.column,
                            fill: dataMapping.fill?.column || styles.color,
                            fillOpacity: styles.fillOpacity,
                            tip: styles.showTooltip
                        }
                    )
                )
            );
        } else {
            marks.push(
                Plot.dot(data,
                    Plot.groupY(
                        aggregationConfig,
                        {
                            y: dataMapping.y.column,
                            fill: dataMapping.fill?.column || styles.color,
                            fillOpacity: styles.fillOpacity,
                            tip: styles.showTooltip
                        }
                    )
                )
            );
        }
    } else {
        // Non-aggregated scatter plot
        marks.push(
            Plot.dot(data, {
                x: dataMapping.x.column,
                y: dataMapping.y.column,
                fill: dataMapping.fill?.column || styles.color,
                r: dataMapping.size?.column || styles.pointRadius,
                fillOpacity: styles.fillOpacity,
                tip: styles.showTooltip
            })
        );
    }
    
    return marks;
}

function createHistogramMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Add baseline rule
    marks.push(Plot.ruleY([0]));
    
    // Histograms have built-in aggregation (binning), but can also have additional aggregation
    const yAggregation = dataMapping.y?.aggregation || 'count';
    
    if (dataMapping.fill?.column) {
        // Stacked histogram by fill column with custom aggregation
        const aggregationConfig = buildAggregationConfig('y', yAggregation, dataMapping.y?.column);
        
        marks.push(
            Plot.rectY(data, 
                Plot.binX(
                    aggregationConfig,
                    {
                        x: dataMapping.x.column,
                        fill: dataMapping.fill.column,
                        fillOpacity: styles.fillOpacity,
                        thresholds: styles.bins,
                        tip: styles.showTooltip
                    }
                )
            )
        );
    } else {
        // Simple histogram with custom aggregation
        const aggregationConfig = buildAggregationConfig('y', yAggregation, dataMapping.y?.column);
        
        marks.push(
            Plot.rectY(data, 
                Plot.binX(
                    aggregationConfig,
                    {
                        x: dataMapping.x.column,
                        fill: styles.color,
                        fillOpacity: styles.fillOpacity,
                        thresholds: styles.bins,
                        tip: styles.showTooltip
                    }
                )
            )
        );
    }
    
    return marks;
}

function createAreaMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Add baseline rule
    marks.push(Plot.ruleY([0]));
    
    // Handle aggregation for area charts
    const needsAggregation = dataMapping.y?.aggregation;
    
    if (needsAggregation) {
        const yAggregation = dataMapping.y.aggregation;
        const aggregationConfig = buildAggregationConfig('y', yAggregation, dataMapping.y.column);
        
        marks.push(
            Plot.areaY(data,
                Plot.groupX(
                    aggregationConfig,
                    {
                        x: dataMapping.x.column,
                        fill: dataMapping.fill?.column || styles.color,
                        fillOpacity: styles.fillOpacity,
                        curve: styles.curveType || 'linear',
                        tip: styles.showTooltip
                    }
                )
            )
        );
    } else {
        // Non-aggregated area
        marks.push(
            Plot.areaY(data, {
                x: dataMapping.x.column,
                y: dataMapping.y.column,
                fill: dataMapping.fill?.column || styles.color,
                fillOpacity: styles.fillOpacity,
                curve: styles.curveType || 'linear',
                tip: styles.showTooltip
            })
        );
    }
    
    return marks;
}

function createBoxMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Box plots inherently show aggregated statistics (quartiles, median, etc.)
    // Additional aggregation might be needed if grouping by categories
    const needsGrouping = dataMapping.x?.aggregation;
    
    if (needsGrouping) {
        // This is less common for box plots, but could be useful for nested grouping
        console.warn('Aggregation on box plots is complex and may not produce expected results');
    }
    
    // Standard box plot
    marks.push(
        Plot.boxY(data, {
            x: dataMapping.x.column,
            y: dataMapping.y.column,
            fill: dataMapping.fill?.column || styles.color,
            fillOpacity: styles.fillOpacity,
            tip: styles.showTooltip
        })
    );
    
    return marks;
}

function createHeatmapMarks(data, dataMapping, styles) {
    const marks = [];
    
    // Handle aggregation for heatmaps
    const fillAggregation = dataMapping.fill?.aggregation || dataMapping.z?.aggregation;
    const fillColumn = dataMapping.fill?.column || dataMapping.z?.column;
    
    if (fillAggregation && fillColumn) {
        // Aggregated heatmap
        const aggregationConfig = buildAggregationConfig('fill', fillAggregation, fillColumn);
        
        marks.push(
            Plot.cell(data,
                Plot.group(
                    aggregationConfig,
                    {
                        x: dataMapping.x.column,
                        y: dataMapping.y.column,
                        tip: styles.showTooltip
                    }
                )
            )
        );
    } else {
        // Non-aggregated heatmap
        marks.push(
            Plot.cell(data, {
                x: dataMapping.x.column,
                y: dataMapping.y.column,
                fill: fillColumn,
                tip: styles.showTooltip
            })
        );
    }
    
    return marks;
}

/**
 * Builds aggregation configuration for Plot transforms
 * @param {string} dimension - The dimension to aggregate (x, y, fill, r, etc.)
 * @param {string} aggregationType - Type of aggregation (count, sum, mean, etc.)
 * @param {string} column - Column to aggregate (null for count)
 * @returns {Object} Aggregation configuration object
 */
// function buildAggregationConfig(dimension, aggregationType, column = null) {
//     const config = {};
    
//     switch (aggregationType.toLowerCase()) {
//         case 'count':
//             config[dimension] = 'count';
//             break;
//         case 'sum':
//             config[dimension] = column ? Plot.sum(column) : 'count';
//             break;
//         case 'mean':
//         case 'average':
//             config[dimension] = column ? Plot.mean(column) : 'count';
//             break;
//         case 'median':
//             config[dimension] = column ? Plot.median(column) : 'count';
//             break;
//         case 'min':
//         case 'minimum':
//             config[dimension] = column ? Plot.min(column) : 'count';
//             break;
//         case 'max':
//         case 'maximum':
//             config[dimension] = column ? Plot.max(column) : 'count';
//             break;
//         default:
//             console.warn(`Unsupported aggregation type: ${aggregationType}, defaulting to count`);
//             config[dimension] = 'count';
//     }
    
//     return config;
// }

/**
 * Builds aggregation configuration for Plot transforms
 * @param {string} dimension       – The channel to aggregate ("x", "y", "fill", "r", etc.)
 * @param {string} aggregationType – e.g. "count", "sum", "mean", etc.
 * @returns {Object}               – e.g. { y: "sum" }
 */
function buildAggregationConfig(dimension, aggregationType) {
  const type = aggregationType.toLowerCase();
  const config = {};
  switch (type) {
    case 'count':
      config[dimension] = 'count';
      break;
    case 'sum':
      config[dimension] = 'sum';
      break;
    case 'mean':
    case 'average':
      config[dimension] = 'mean';
      break;
    case 'median':
      config[dimension] = 'median';
      break;
    case 'min':
    case 'minimum':
      config[dimension] = 'min';
      break;
    case 'max':
    case 'maximum':
      config[dimension] = 'max';
      break;
    case 'first':
      config[dimension] = 'first';
      break;
    case 'last':
      config[dimension] = 'last';
      break;
    case 'std':
    case 'stddev':
      config[dimension] = 'deviation';
      break;
    case 'variance':
      config[dimension] = 'variance';
      break;
    default:
      console.warn(
        `Unsupported aggregation type: ${aggregationType}, defaulting to count`
      );
      config[dimension] = 'count';
  }
  return config;
}


function createErrorPlot(errorMessage, styles) {
    const defaultWidth = 640;
    const defaultHeight = 400;
    
    return Plot.plot({
        width: styles?.width || defaultWidth,
        height: styles?.height || defaultHeight,
        x: { domain: [0, 1] },
        y: { domain: [0, 1] },
        marks: [
            Plot.text([{ x: 0.5, y: 0.5, message: errorMessage }], {
                x: 'x',
                y: 'y',
                text: d => `Error: ${d.message}`,
                fontSize: 14,
                fill: 'red',
                textAnchor: 'middle'
            })
        ]
    });
}

// Helper function to validate data and mapping
export function validateInputs(data, chartRecommendation) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid or empty data array');
    }
    
    if (!chartRecommendation || !chartRecommendation.dataMapping) {
        throw new Error('Invalid chart recommendation or missing data mapping');
    }
    
    const { dataMapping, plotType } = chartRecommendation;
    if (!dataMapping.x?.column) {
        throw new Error('Missing x-axis column mapping');
    }
    
    // Check if columns exist in data
    const sampleRow = data[0];
    if (!sampleRow.hasOwnProperty(dataMapping.x.column)) {
        throw new Error(`Column '${dataMapping.x.column}' not found in data`);
    }
    
    if (dataMapping.y?.column && !sampleRow.hasOwnProperty(dataMapping.y.column)) {
        throw new Error(`Column '${dataMapping.y.column}' not found in data`);
    }
    
    // Validate aggregation types
    const supportedAggregations = ['count', 'sum', 'mean', 'average', 'median', 'min', 'max', 'minimum', 'maximum', 'first', 'last', 'std', 'stddev', 'variance'];
    
    if (dataMapping.x?.aggregation && !supportedAggregations.includes(dataMapping.x.aggregation.toLowerCase())) {
        throw new Error(`Unsupported x-axis aggregation: ${dataMapping.x.aggregation}`);
    }
    
    if (dataMapping.y?.aggregation && !supportedAggregations.includes(dataMapping.y.aggregation.toLowerCase())) {
        throw new Error(`Unsupported y-axis aggregation: ${dataMapping.y.aggregation}`);
    }
    
    // Additional validation for specific plot types
    if (plotType === 'heatmap' && !dataMapping.fill?.column && !dataMapping.z?.column) {
        throw new Error('Heatmap requires a fill or z column mapping');
    }
    
    // Validate that aggregation columns exist when aggregation is specified
    if (dataMapping.x?.aggregation && dataMapping.x.aggregation !== 'count' && dataMapping.x.column && !sampleRow.hasOwnProperty(dataMapping.x.column)) {
        throw new Error(`Aggregation column '${dataMapping.x.column}' not found in data`);
    }
    
    if (dataMapping.y?.aggregation && dataMapping.y.aggregation !== 'count' && dataMapping.y.column && !sampleRow.hasOwnProperty(dataMapping.y.column)) {
        throw new Error(`Aggregation column '${dataMapping.y.column}' not found in data`);
    }
}