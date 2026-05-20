const fs = require("fs");
const https = require("https");
const sharp = require("sharp");
const PDFDocument = require("pdfkit");

async function convertImage(
  bot,
  fileId,
  chatId,
  token,
  format
) {

  try {

    const file = await bot.getFile(fileId);

    const fileUrl =
      `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    const inputPath =
      `temp/input_${Date.now()}`;

    let outputPath = "";

    // Output path
    if (format === "img-to-pdf") {

      outputPath =
        `temp/output_${Date.now()}.pdf`;
    }

    else {

      outputPath =
        `temp/output_${Date.now()}.${format}`;
    }

    const fileStream =
      fs.createWriteStream(inputPath);

    https.get(fileUrl, (response) => {

      response.pipe(fileStream);

      fileStream.on("finish", async () => {

        fileStream.close();

        try {

          // =========================
          // IMAGE TO PDF
          // =========================

          if (format === "img-to-pdf") {

            const doc =
              new PDFDocument();

            const stream =
              fs.createWriteStream(outputPath);

            doc.pipe(stream);

            doc.image(
              inputPath,
              {
                fit: [500, 700],
                align: "center",
                valign: "center",
              }
            );

            doc.end();

            stream.on("finish", async () => {

              await bot.sendDocument(
                chatId,
                outputPath
              );

              fs.unlinkSync(inputPath);
              fs.unlinkSync(outputPath);
            });

            return;
          }

          // =========================
          // IMAGE CONVERSIONS
          // =========================

          let converter =
            sharp(inputPath);

          // PNG
          if (format === "png") {
            converter =
              converter.png();
          }

          // JPG
          else if (format === "jpg") {
            converter =
              converter.jpeg();
          }

          // WEBP
          else if (format === "webp") {
            converter =
              converter.webp();
          }

          // AVIF
          else if (format === "avif") {
            converter =
              converter.avif();
          }

          // GIF
          else if (format === "gif") {
            converter =
              converter.gif();
          }

          await converter.toFile(
            outputPath
          );

          await bot.sendDocument(
            chatId,
            outputPath
          );

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);

        } catch (err) {

          console.log(err);

          bot.sendMessage(
            chatId,
            "Conversion failed."
          );
        }
      });
    });

  } catch (error) {

    console.log(error);

    bot.sendMessage(
      chatId,
      "Error processing image."
    );
  }
}

module.exports = {
  convertImage,
};