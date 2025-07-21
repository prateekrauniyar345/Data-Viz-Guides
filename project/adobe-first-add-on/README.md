# Data Visualization Add-on for Adobe Express

A powerful Adobe Express add-on that enables users to upload CSV/XLSX files, generate intelligent chart recommendations using AI, and create interactive visualizations that can be directly inserted into Adobe Express documents.

## 🚀 Features

- **File Upload Support**: Drag & drop or select CSV and XLSX files
- **AI-Powered Chart Recommendations**: Get intelligent suggestions for univariate, bivariate, and multivariate visualizations
- **Interactive Chart Generation**: Create charts using Observable Plot with customizable styling
- **Real-time Style Customization**: Modify colors, dimensions, margins, and other visual properties
- **Seamless Adobe Integration**: Insert generated charts directly into Adobe Express documents
- **Chart Export**: Export charts as PNG images for use outside Adobe Express

## 🛠 Technology Stack

- **Frontend**: React 18+ with modern hooks (useState, useEffect, useCallback, useMemo)
- **Charting Library**: Observable Plot for high-quality, interactive visualizations  
- **File Processing**: Papa Parse for CSV parsing, SheetJS for Excel file handling
- **Adobe Integration**: Adobe Express Document Sandbox Runtime API
- **Build Tools**: Webpack, Babel
- **Styling**: Bootstrap CSS with custom styling

## 📋 Prerequisites

- Node.js 16+ and npm
- Adobe Express developer account
- Modern web browser with JavaScript support

## ⚡ Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run start
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Load in Adobe Express**
   - Open Adobe Express
   - Navigate to Add-ons > Load unpacked add-on
   - Select the built add-on directory

## 🏗 Project Structure

```
Data-visualization-add-on/
├── src/
│   ├── index.html              # Main HTML entry point
│   ├── manifest.json           # Adobe add-on configuration
│   ├── sandbox/
│   │   └── code.js            # Document sandbox runtime code
│   └── ui/
│       ├── index.jsx          # React app entry point
│       ├── components/
│       │   ├── FileUpload.jsx      # File upload & processing
│       │   ├── ChartsOption.jsx    # Chart recommendations display
│       │   ├── ChartCard.jsx       # Individual chart preview
│       │   ├── PlotsReview.jsx     # Chart review & insertion
│       │   ├── PlotStyles.jsx      # Style customization controls
│       │   └── CustomDialog.jsx    # Insights modal dialog
│       └── utils/
│           ├── plotGenerator.js    # Observable Plot chart generation
│           ├── fileParser.js       # CSV/XLSX file parsing utilities
│           └── llmService.js       # AI chart recommendation service
├── api/
│   └── Work.js                # Serverless function for AI processing
├── package.json
├── webpack.config.js
└── README.md
```

## 🎯 Core Components

### FileUpload Component
- Handles drag & drop file uploads
- Supports CSV and XLSX formats
- Validates file types and displays upload progress
- Integrates with AI service for chart recommendations

### ChartsOption Component  
- Displays categorized chart recommendations (univariate, bivariate, multivariate)
- Manages chart generation state and style customization
- Provides real-time chart preview and regeneration

### Observable Plot Integration
- Supports multiple chart types: bar, line, scatter, histogram, area, box, heatmap
- Dynamic color schemes and styling options
- Aggregation support (count, sum, mean, median, min, max)
- Responsive and accessible visualizations

### Adobe Document Integration
- Converts charts to PNG format using canvas rendering
- Inserts charts as image containers in Adobe Express documents
- Handles positioning and sizing of inserted charts

## 🎨 Supported Chart Types

| Chart Type | Description | Use Case |
|------------|-------------|----------|
| Bar Chart | Vertical/horizontal bars | Categorical comparisons |
| Line Chart | Connected data points | Trends over time |
| Scatter Plot | Point-based visualization | Correlation analysis |
| Histogram | Distribution visualization | Data distribution analysis |
| Area Chart | Filled line chart | Cumulative values |
| Box Plot | Statistical summary | Quartile analysis |
| Heatmap | Color-coded matrix | Correlation matrices |

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:
```env
REACT_APP_API_ENDPOINT=your-serverless-function-url
REACT_APP_LLM_API_KEY=your-ai-service-key
```

### Adobe Manifest
The `manifest.json` configures add-on permissions and metadata:
```json
{
  "manifestVersion": 1,
  "id": "data-visualization-addon",
  "name": "Data Visualization",
  "version": "1.0.0",
  "main": "index.html",
  "uiEntry": {
    "type": "panel",
    "src": "index.html"
  }
}
```

## 🧪 Development Workflow

1. **File Upload**: Test with sample CSV/XLSX files in `extras/test-datas/`
2. **AI Integration**: Verify chart recommendations through the LLM service
3. **Chart Generation**: Test different chart types and style combinations
4. **Adobe Integration**: Validate chart insertion into documents
5. **Error Handling**: Test edge cases and file format variations

## 📊 Sample Data Files

The project includes test datasets:
- `adult.csv` - Adult income dataset
- `Titanic.xlsx` - Titanic passenger data  
- `winequality-red.csv` - Wine quality metrics
- `winequality-white.csv` - White wine analysis data

## 🐛 Troubleshooting

### Common Issues

1. **Charts not updating colors**
   - Ensure `styles.color` is properly passed to mark functions
   - Check that Observable Plot color configuration is correctly applied

2. **File upload failures**
   - Verify file format (CSV/XLSX only)
   - Check file size limits and encoding

3. **AI recommendations not loading**
   - Confirm API endpoint configuration
   - Check serverless function deployment status

4. **Adobe integration errors**
   - Verify add-on permissions in manifest.json
   - Check sandbox runtime API usage

### Debug Mode
Enable debug logging by adding to your component:
```javascript
console.log('🎨 STYLE DEBUG:', {
    receivedStyles: styles,
    colorFromStyles: styles.color
});
```

## 📈 Performance Optimization

- Uses React hooks for efficient re-rendering (useCallback, useMemo)
- Implements file processing with progress indicators
- Optimizes chart generation with Observable Plot's efficient rendering
- Manages memory with proper blob URL cleanup

## 🔒 Security Considerations

- Client-side file processing (no server upload required)
- Sandboxed execution environment
- Input validation for uploaded data
- Safe chart generation with error boundaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is created with Adobe's Create CC Web Add-on tool and follows Adobe's add-on development guidelines.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section above
- Review Adobe Express Add-on documentation
- Open an issue in the project repository

---

**Built with ❤️ for Adobe Express developers**