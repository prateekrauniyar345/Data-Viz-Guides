// serverless function in Next.js
// this will only work automatically if you are using Next.js or deploying to Vercel.
// If you are running a plain React app (like with Create React App, Vite, or similar), just putting a 
// file in /api does not create an API endpoint.



export default function handler(req, res) {
  res.status(200).json({ message: "Hello from the serverless function!" });
}