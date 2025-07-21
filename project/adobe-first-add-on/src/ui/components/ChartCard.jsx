import React, { useState } from "react";
import { Button } from '@swc-react/button';
import PlotStyleController from './PlotStyles';

const ChartCard = ({ 
    chart, 
    selectedChart, 
    setSelectedChart, 
    chartStyles, 
    handleStyleChange, 
    generateChart  
}) => {

    // Helper functions for colors
    const getChartTypeColor = (plotType) => {
        const colors = {
            'bar': '#3b82f6',
            'line': '#10b981', 
            'scatter': '#f59e0b',
            'histogram': '#8b5cf6',
            'area': '#06b6d4',
            'pie': '#ef4444',
            'box': '#84cc16',
            'heatmap': '#f97316'
        };
        return colors[plotType] || '#6b7280';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b', 
            'low': '#6b7280'
        };
        return colors[priority] || '#6b7280';
    };

    return (
        <div 
        className='' 
        key={chart.id} 
        style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px',
            marginBottom: '16px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
            width: '95%',
            boxSizing: 'border-box'
        }}>
            {/* Chart Header */}
            <div style={{
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px',
                marginBottom: '16px', 
                textAlign: 'left',
            }}>
                <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    lineHeight: '1.3'
                }}>
                    {chart.title}
                </h4>

                <div style={{ marginBottom: '8px' , textAlign: 'left'}}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', width: '70px', fontWeight: '500' }}>
                            Plot Type:
                        </span>
                        <span style={{
                            backgroundColor: getChartTypeColor(chart.plotType),
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {chart.plotType}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', width: '70px', fontWeight: '500' }}>
                            Priority:
                        </span>
                        <span style={{
                            backgroundColor: getPriorityColor(chart.priority),
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {chart.priority}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', width: '70px', fontWeight: '500' }}>
                            Category:
                        </span>
                        <span style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '2px 5px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {chart.category}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', width: '70px', fontWeight: '500' }}>
                            Confidence:
                        </span>
                        <span style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}>
                            {Math.round(chart.confidence * 100)}%
                        </span>
                    </div>
                </div>
                
                <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '13px',
                    lineHeight: '1.4'
                }}>
                    {chart.description}
                </p>
            </div>

            {/* Data Mapping Info */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px',
                marginBottom: '12px',
                textAlign: 'left'
            }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Data Mapping
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.3' }}>
                    <strong>X-Axis:</strong> {chart.dataMapping.x.column} ({chart.dataMapping.x.type}) 
                    {chart.dataMapping.y && (
                        <span><br/><strong>Y-Axis:</strong> {chart.dataMapping.y.column} ({chart.dataMapping.y.type})</span>
                    )}
                </div>
            </div>

            {/* Reasoning & Insights */}
            <div style={{ marginBottom: '16px' }}>
                <details style={{ marginBottom: '8px' }}>
                    <summary style={{
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px',
                        textAlign: 'left'
                    }}>
                        Why this chart? 🤔
                    </summary>
                    <p style={{
                        margin: '6px 0 0 16px',
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                    }}>
                        {chart.reasoning}
                    </p>
                </details>
                
                <details>
                    <summary style={{
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px', 
                        textAlign: 'left'
                    }}>
                        Expected insights 💡
                    </summary>
                    <p style={{
                        margin: '6px 0 0 16px',
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                    }}>
                        {chart.insights}
                    </p>
                </details>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
            }}>
                <Button
                    size="s"
                    onClick={() => setSelectedChart(selectedChart === chart.id ? null : chart.id)}
                    style={{    
                        backgroundColor: selectedChart === chart.id ? '#ef4444' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                }}>
                    {selectedChart === chart.id ? 'Hide Settings' : 'Customize'}
                </Button>
                
                <Button
                size="s"
                onClick={() => generateChart(chart, chartStyles[chart.id])}
                style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }}
                >
                Generate Chart
                </Button>
            </div>

            {/* Expandable Style Controller */}
            {selectedChart === chart.id && (
                <div style={{
                    marginTop: '16px',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px'
                }}>
                <PlotStyleController 
                    plotRecommendation={chart}
                    onStyleChange={(styles) => handleStyleChange(chart.id, styles)}
                />
                </div>
            )}
        </div>
  );
}
export  { ChartCard };