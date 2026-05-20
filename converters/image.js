const fs = require("fs");
const https = require("https");
const path = require("path"); // ← YOU MISSED THIS!
const sharp = require("sharp");
const PDFDocument = require("pdfkit");

// ===== CREATE TEMP DIRECTORY ON MODULE LOAD =====
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('✓ Created temp directory:', tempDir);
} else {
  console.log('✓ Temp directory already exists:', tempDir);
}

async function convertImage(bot, fileId, chatId, token, format) {
  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    
    // Use path.join for proper path handling
    const inputPath = path.join(tempDir, `input_${Date.now()}_${Math.random()}`);
    
    let outputPath = "";
    
    // Output path
    if (format === "img-to-pdf") {
      outputPath = path.join(tempDir, `output_${Date.now()}.pdf`);
    } else {
      outputPath = path.join(tempDir, `output_${Date.now()}.${format}`);
    }
    
    console.log(`Input path: ${inputPath}`);
    console.log(`Output path: ${outputPath}`);
    
    const fileStream = fs.createWriteStream(inputPath);
    
    https.get(fileUrl, (response) => {
      response.pipe(fileStream);
      
      fileStream.on("finish", async () => {
        fileStream.close();
        
        try {
          // =========================
          // IMAGE TO PDF
          // =========================
          if (format === "img-to-pdf") {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);
            
            doc.pipe(stream);
            
            doc.image(inputPath, {
              fit: [500, 700],
              align: "center",
              valign: "center",
            });
            
            doc.end();
            
            stream.on("finish", async () => {
              await bot.sendDocument(chatId, outputPath);
              
              // Clean up
              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
            
            return;
          }
          
          // =========================
          // IMAGE CONVERSIONS
          // =========================
          let converter = sharp(inputPath);
          
          // PNG
          if (format === "png") {
            converter = converter.png();
          }
          // JPG
          else if (format === "jpg") {
            converter = converter.jpeg();
          }
          // WEBP
          else if (format === "webp") {
            converter = converter.webp();
          }
          // AVIF
          else if (format === "avif") {
            converter = converter.avif();
          }
          // GIF
          else if (format === "gif") {
            converter = converter.gif();
          }
          
          await converter.toFile(outputPath);
          await bot.sendDocument(chatId, outputPath);
          
          // Clean up
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          
        } catch (err) {
          console.error("Conversion error:", err);
          bot.sendMessage(chatId, "Conversion failed.");
          
          // Clean up on error
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      });
      
      response.on("error", (err) => {
        console.error("Download error:", err);
        bot.sendMessage(chatId, "Failed to download image.");
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      });
    });
    
  } catch (error) {
    console.error("Processing error:", error);
    bot.sendMessage(chatId, "Error processing image.");
  }
}

module.exports = {
  convertImage,
};