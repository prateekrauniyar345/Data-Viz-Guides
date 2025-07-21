import { GoogleGenAI } from "@google/genai";


// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: ""});


/**
 * LLM (Large Language Model) response Type defination
*/
import { Type } from "@google/genai";

const responseSchema = {
      type: Type.OBJECT,
      properties: {
        dataAnalysis: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dataTypes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  column: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["categorical", "numerical", "temporal", "boolean"] },
                  uniqueValues: { type: Type.NUMBER },
                  isVisualizationReady: { type: Type.BOOLEAN } // Skip high-cardinality IDs
                },
                required: ["column", "type", "uniqueValues", "isVisualizationReady"], 
                propertyOrdering: ["column", "type", "uniqueValues", "isVisualizationReady"]
              }
            },
            recordCount: { type: Type.NUMBER },
            potentialIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "keyFindings", "dataTypes", "recordCount", "potentialIssues"], 
          propertyOrdering: ["summary", "keyFindings", "dataTypes", "recordCount", "potentialIssues"]
        },

        plotRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              plotType: { 
                type: Type.STRING, 
                enum: ["bar", "line", "scatter", "histogram", "heatmap", "box", "area"] 
              },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: ["univariate", "bivariate", "multivariate"] 
              },
              priority: { 
                type: Type.STRING, 
                enum: ["high", "medium", "low"] 
              },
              reasoning: { type: Type.STRING },
              
              // Core data mapping - NO styling
              dataMapping: {
                type: Type.OBJECT,
                properties: {
                  x: {
                    type: Type.OBJECT,
                    properties: {
                      column: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["categorical", "numerical", "temporal"] },
                      label: { type: Type.STRING }
                    },
                    required: ["column", "type", "label"],
                    propertyOrdering: ["column", "type", "label"]
                  },
                  y: {
                    type: Type.OBJECT,
                    properties: {
                      column: { 
                        type: [Type.STRING, Type.NULL] // Explicitly allow null
                        // Allow null/empty when using aggregations that don't need a specific column
                      },
                      type: { type: Type.STRING, enum: ["categorical", "numerical", "temporal"] },
                      label: { type: Type.STRING },
                      aggregation: { type: Type.STRING, enum: ["count", "sum", "mean", "median", "min", "max"] }
                    },
                    required: ["type", "label"], // Remove "column" from required since it can be null for count
                    propertyOrdering: ["column", "type", "label", "aggregation"]
                  },
                  fill: {
                    type: Type.OBJECT,
                    properties: {
                      column: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["categorical", "numerical"] }
                    },
                    // Make this optional since fill might not always be needed
                    required: []
                  },
                  size: {
                    type: Type.OBJECT,
                    properties: {
                      column: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["numerical"] }
                    },
                    // Make this optional since size might not always be needed
                    required: []
                  }
                },
                required: ["x", "y"], // Only x and y are always required, fill and size are optional
                propertyOrdering: ["x", "y", "fill", "size"]
              },

              // Essential Observable Plot marks - NO styling options
              plotMarks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    markType: { 
                      type: Type.STRING,
                      enum: ["barY", "barX", "line", "dot", "area", "areaY", "cell", "boxY", "boxX", "rectY", "ruleY", "ruleX", "text", "frame"]
                    },
                    channels: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.STRING },
                        y: { type: Type.STRING },
                        fill: { type: Type.STRING },
                        stroke: { type: Type.STRING },
                        size: { type: Type.STRING },
                        text: { type: Type.STRING }
                      }
                    },
                    isBaseline: { type: Type.BOOLEAN } // For ruleY([0]), ruleX([0])
                  },
                  required: ["markType", "channels"], 
                  propertyOrdering: ["markType", "channels", "isBaseline"]
                }
              },

              insights: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              suggestedDefaultSize: {
                type: Type.OBJECT,
                properties: {
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER }
                },
                required: ["width", "height"]
              }
            },
            required: ["id", "plotType", "title", "description", "category", "priority", "reasoning", "dataMapping", "plotMarks", "insights", "confidence", "suggestedDefaultSize"], 
            propertyOrdering: [
              "id", "plotType", "title", "description", "category", "priority", 
              "reasoning", "dataMapping", "plotMarks", "insights", "confidence", 
              "suggestedDefaultSize"
            ]
          }
        },

        additionalSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["dataAnalysis", "plotRecommendations", "additionalSuggestions"], 
      propertyOrdering: [
        "dataAnalysis", "plotRecommendations", "additionalSuggestions"
      ]
    };


// System instruction for the LLM to analyze data and recommend chart types
const SystemInstructionForCharts = `You are an expert data visualization consultant and Observable Plot specialist.

Your task is to analyze the provided dataset and produce structured JSON output for automatic chart generation.

---

1. **DATA ANALYSIS**
Analyze the dataset and extract:
- Brief summary of what the dataset represents
- Key statistical insights (patterns, trends, correlations, outliers)
- Data types per column: "categorical", "numerical", "temporal", or "boolean"
- Unique values count per column
- Mark columns as visualization-ready (exclude high-cardinality IDs)
- Record count
- Potential data quality issues

**COLUMN CLASSIFICATION RULES:**
- Mark isVisualizationReady: false for:
  * High-cardinality categorical columns (>50 unique values)
  * ID columns (customer_id, user_id, order_id, etc.)
  * Email addresses, phone numbers, URLs
  * Sequential identifiers that aren't measurements

2. **PLOT RECOMMENDATIONS**
Generate 3-5 plot recommendations with complete Observable Plot specifications.

For each recommendation:

**Basic Information:**
- Unique ID (format: "plotType_xColumn_by_yColumn", e.g., "line_temp_by_month")
- Plot type: "bar", "line", "scatter", "histogram", "heatmap", "box", "area", "pie"
- Clear title and description
- Category: "univariate", "bivariate", or "multivariate"
- Priority: "high", "medium", "low" based on data insights value
- Reasoning: Why this plot type is optimal for this data

**Data Mapping (Observable Plot channels):**
- x: {column: "column_name", type: "categorical|numerical|temporal", label: "Display Label"}
- y: {column: "column_name", type: "categorical|numerical|temporal", label: "Display Label"}
- fill: {column: "column_name", type: "categorical|numerical"} [optional - for grouping/coloring]
- size: {column: "column_name", type: "numerical"} [optional - for bubble charts]

**Observable Plot Marks:**
Specify exact mark types and channels:
- markType: "barY", "barX", "line", "dot", "area", "areaY", "cell", "boxY", "boxX", "rectY", "ruleY", "ruleX"
- channels: {x: "column", y: "column", fill: "column", stroke: "column", etc.}
- isBaseline: true for baseline rules (ruleY([0]), ruleX([0]))

**PLOT TYPE GUIDELINES:**
- **Bar charts**: Use "barY" for vertical, "barX" for horizontal
- **Line charts**: Use "line" mark, add "dot" marks for points if desired
- **Scatter plots**: Use "dot" mark type
- **Area charts**: Use "areaY", consider "line" overlay
- **Histograms**: Use "rectY" with binning
- **Heatmaps**: Use "cell" mark type
- **Box plots**: Use "boxY" or "boxX"

**Other Requirements:**
- insights: What patterns/trends this chart will reveal
- confidence: 0-1 score for recommendation quality
- suggestedDefaultSize: {width: 600-1000, height: 300-600}

**ALWAYS INCLUDE baseline rules** (ruleY([0]) or ruleX([0])) for bar/area charts.

3. **ADDITIONAL SUGGESTIONS**
Provide 2-3 suggestions for deeper analysis, advanced visualizations, or data transformations.

---

4. **RESPONSE FORMAT**
Return ONLY valid JSON matching this exact structure:

{
  "dataAnalysis": {
    "summary": "string describing the dataset",
    "keyFindings": ["insight 1", "insight 2", "insight 3"],
    "dataTypes": [
      {
        "column": "column_name",
        "type": "categorical|numerical|temporal|boolean",
        "uniqueValues": number,
        "isVisualizationReady": boolean
      }
    ],
    "recordCount": number,
    "potentialIssues": ["issue 1", "issue 2"]
  },
  "plotRecommendations": [
    {
      "id": "plottype_xcol_by_ycol",
      "plotType": "bar|line|scatter|histogram|heatmap|box|area|pie",
      "title": "Chart Title",
      "description": "What this chart shows",
      "category": "univariate|bivariate|multivariate",
      "priority": "high|medium|low",
      "reasoning": "Why this chart type is optimal",
      "dataMapping": {
        "x": {"column": "col_name", "type": "categorical|numerical|temporal", "label": "Axis Label"},
        "y": {"column": "col_name" || null, "type": "categorical|numerical|temporal", "label": "Axis Label", aggregation: ["count", "sum", "mean", "median", "min", "max"] },
        "fill": {"column": "col_name", "type": "categorical|numerical"},
        "size": {"column": "col_name", "type": "numerical"}
      },
      "plotMarks": [
        {
          "markType": "barY|line|dot|area|etc",
          "channels": {"x": "column", "y": "column", "fill": "column"},
          "isBaseline": false
        }
      ],
      "insights": "What patterns this will reveal",
      "confidence": 0.95,
      "suggestedDefaultSize": {"width": 800, "height": 400}
    }
  ],
  "additionalSuggestions": ["suggestion 1", "suggestion 2"]
}

**CRITICAL:**
- NO conversational text, explanations, or markdown fences
- ONLY return the raw JSON object
- Ensure all required fields are present
- Use only the specified enum values
- Generate meaningful, descriptive IDs
- Focus on visualization-ready columns only
- when using aggregations that don't need a specific column, set "column" to null/empty`;


async function Test1(data) {
    // data checking, if it's empty or not or if it's an array with no elements
    if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("No data provided for analysis.");
    }

    // get the first 100 rows of data for sending it to llm
    const sampleData = data.slice(0, 100);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                // Corrected: `systemInstruction` (singular) is the typical API field name
                systemInstruction: {
                    parts: [
                        { text: SystemInstructionForCharts }
                    ]
                },
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: "What is the best chart to visualize this data? " + JSON.stringify(sampleData), }] //
                }
            ]
        });

        // The Gemini API response object from generateContent has a .text() method
        // that directly extracts the text from the response.
        // If responseMimeType is application/json, this .text() method
        // will attempt to return the JSON string.
        const rawTextResponse = response.text; // Await the text() method

        // IMPORTANT: Attempt to parse the text as JSON
        try {
            const parsedJsonResponse = JSON.parse(rawTextResponse);
            return parsedJsonResponse; // Return the parsed JSON object
        }
        catch (parseError) {
            console.error("Error parsing LLM response as JSON:", parseError);
            console.error("Raw LLM response:", rawTextResponse); // Log the raw response for debugging
            throw new Error("LLM response was not valid JSON. Please try again or refine prompt.");
        }

    } catch (error) {
        console.error("Error in LLM response generation:", error);
        throw new Error("Failed to get LLM response. Please try again.");
    }
}

export { Test1 };