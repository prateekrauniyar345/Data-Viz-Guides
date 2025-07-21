import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;

            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };

            // Define rectangle color.
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        }, 
        //  Updated function to use createImageContainer
        addChartToDocument: async (pngBlob, options = {}) => {
            try {
                console.log('📊 Adding chart to document...', { 
                    blobSize: pngBlob.size, 
                    blobType: pngBlob.type,
                    options 
                });
                
                // ✅ Step 1: Load the PNG blob as a BitmapImage
                const bitmapImage = await editor.loadBitmapImage(pngBlob);
                console.log('✅ BitmapImage loaded successfully');
                
                // ✅ Step 2: Queue the edit to add to document
                await editor.queueAsyncEdit(() => {
                    try {
                        // ✅ Step 3: Create image container with the bitmap
                        const imageContainer = editor.createImageContainer(bitmapImage, {
                            // Set initial size if dimensions are provided
                            initialSize: options.width && options.height ? {
                                width: options.width,
                                height: options.height
                            } : undefined
                        });
                        
                        // ✅ Step 4: Position the container if specified
                        if (options.x !== undefined && options.y !== undefined) {
                            imageContainer.translation = { 
                                x: options.x, 
                                y: options.y 
                            };
                        } else {
                            // Default position
                            imageContainer.translation = { x: 50, y: 50 };
                        }
                        
                        // ✅ Step 5: Add to document
                        const insertionParent = editor.context.insertionParent;
                        insertionParent.children.append(imageContainer);
                        
                        console.log('✅ Chart image added to document successfully!');
                        
                    } catch (containerError) {
                        console.error('❌ Error creating image container:', containerError);
                        throw containerError;
                    }
                });
                
                return { success: true };
                
            } catch (error) {
                console.error('❌ Failed to add chart to document:', error);
                return { success: false, error: error.message };
            }
        }
        
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
