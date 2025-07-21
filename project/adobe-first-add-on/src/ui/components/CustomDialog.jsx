// imports
import React, { useCallback, useState, useEffect } from 'react';
import { Dialog } from '@swc-react/dialog';
import { Button } from '@swc-react/button';
import { Overlay } from '@swc-react/overlay';

function CustomDialog({ isOpen, data, handleModalClose }) {
    // Ensure 'data' and 'llmResponse' are not null/undefined before accessing nested properties
    const response = data?.llmResponse;

    // Guard clause: if response or its necessary parts are missing, render nothing or a loading state
    if (!response || !response.dataAnalysis) {
        return null; // Or render a loading indicator, or an error message
    }

    // Create a proper close handler - removed setTimeout
    const handleClose = useCallback(() => {
        handleModalClose();
    }, [handleModalClose]);

    // Simplified ESC key handling - removed body scroll management to avoid conflicts
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                handleClose();
            }
        };

        if (isOpen) {
            // Use capture phase to ensure we get the event first
            document.addEventListener('keydown', handleEscapeKey, true);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey, true);
        };
    }, [isOpen, handleClose]);

    // Don't render anything if modal is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className='' style={{ width: '80%' }}>
            {/* The Overlay component provides the modal behavior for the Dialog */}
            <Overlay
                open={isOpen}
                type="modal"
                onClose={handleClose}
                style={{
                    // Overlay backdrop styling
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Dialog
                    headline={`Data Preview for ${data.fileName || 'Unknown File'}`}
                    cancelLabel="Close"
                    onClose={handleClose} // Make sure this matches your close handler
                    dismissable={true}
                    open={isOpen}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e5e7eb',
                        width: '100vw',
                        maxWidth: '600px',
                        maxHeight: '95vh',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 1001,
                        margin: '7px',
                    }}
                >
                    {/* Header styling - removed duplicate title since Dialog handles headline */}
                    <div style={{
                        padding: '20px 24px 0 24px',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '20px'
                    }}>
                        {/* The Dialog component should handle the header/title automatically */}
                    </div>

                    {/* The content of the dialog goes here */}
                    <div style={{
                        padding: '0 24px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.6'
                    }}>
                        {/* Data Analysis Summary */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px', 
                            textAlign: 'left',
                        }}>
                            <h4 style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Summary
                            </h4>
                            <p style={{
                                margin: 0,
                                color: '#6b7280',
                                lineHeight: '1.6'
                            }}>
                                {response.dataAnalysis.summary}
                            </p>
                        </div>

                        {/* key findings */}
                        <div className='' style={{ textAlign: 'left' }}>
                            {response.dataAnalysis.keyFindings && response.dataAnalysis.keyFindings.length > 0 && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    textAlign: 'left',
                                }}>
                                    <h4 style={{        
                                        margin: '0 0 12px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Key Findings
                                    </h4>
                                    <ul style={{
                                        paddingLeft: '20px',
                                        color: '#6b7280',
                                        lineHeight: '1.6'
                                    }}>
                                        {response.dataAnalysis.keyFindings.map((finding, index) => (
                                            <li key={index} style={{ marginBottom: '8px' }}>
                                                {finding}
                                            </li>
                                        ))} 
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Plot Recommendations */}
                        <div className='' style={{ textAlign: 'left' }}>
                            {response.plotRecommendations && response.plotRecommendations.length > 0 && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    textAlign: 'left',
                                }}>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Plot Recommendations
                                    </h4>
                                    <div style={{
                                        paddingLeft: '20px',
                                        color: '#6b7280',
                                        lineHeight: '1.6'
                                    }}>
                                        {response.plotRecommendations.map((rec, index) => (
                                            <div key={index} style={{ marginBottom: '16px' }}>
                                                <strong style={{ color: '#374151', fontWeight: 'bold' }}>
                                                    {`${index + 1}. ${rec.plotType} - plot`}
                                                </strong>
                                                <p><strong>Description:</strong> {rec.description}</p>
                                                <p><strong>Plot Type:</strong> {rec.category}</p>
                                                <p><strong>Reasoning:</strong> {rec.reasoning}</p>  
                                                <p><strong>X-Axis:</strong> {rec.dataMapping.x.column} <strong>| Y-Axis:</strong> {rec.dataMapping.y.column}</p>
                                                <p><strong>Insights:</strong> {rec.insights}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Suggestions */}
                        <div className='' style={{ textAlign: 'left' }}>
                            {response.additionalSuggestions && response.additionalSuggestions.length > 0 && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    textAlign: 'left',
                                }}>
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Additional Suggestions
                                    </h4>
                                    <ol style={{
                                        paddingLeft: '20px',
                                        color: '#6b7280',
                                        lineHeight: '1.6'
                                    }}>
                                        {response.additionalSuggestions.map((suggestion, index) => (
                                            <li key={index} style={{ marginBottom: '8px' }}>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer with close button */}
                    <div style={{
                        padding: '20px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    }}>
                        <Button 
                            onClick={handleClose}
                            style={{
                                backgroundColor: '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                        >
                            Close
                        </Button>
                    </div>
                </Dialog>
            </Overlay>
        </div>
    );
}

export { CustomDialog };