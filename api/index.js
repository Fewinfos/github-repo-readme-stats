const fs = require('fs');
const path = require('path');

// Export a function that can be used as a Vercel serverless function
module.exports = (req, res) => {
  // Set the content type for the image
  res.setHeader('Content-Type', 'image/png');
  
  // Path to the banner image
  const imagePath = path.join(__dirname, '../assets/fewinfos-banner.png');
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Return the image
    return res.end(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.statusCode = 500;
    return res.end('Error loading image');
  }
};
