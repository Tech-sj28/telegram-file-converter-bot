const fs = require("fs");
const https = require("https");
const libre = require("libreoffice-convert");
const pdfParse = require("pdf-parse");
const PDFDocument = require("pdfkit");
const pdfPoppler = require("pdf-poppler");

async function convertPdf(
  bot,
  fileId,
  chatId,
  token,
  type
) {

  try {

    const file = await bot.getFile(fileId);

    const fileUrl =
      `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    const inputPath =
      `temp/input_${Date.now()}.pdf`;

    let outputPath = "";

    if (type === "pdf-to-docx") {
      outputPath =
        `temp/output_${Date.now()}.docx`;
    }

    else if (type === "docx-to-pdf") {
      outputPath =
        `temp/output_${Date.now()}.pdf`;
    }

    else if (type === "pdf-to-txt") {
      outputPath =
        `temp/output_${Date.now()}.txt`;
    }

    else if (type === "txt-to-pdf") {
      outputPath =
        `temp/output_${Date.now()}.pdf`;
    }

    else if (type === "pdf-to-html") {
      outputPath =
        `temp/output_${Date.now()}.html`;
    }

    const fileStream =
      fs.createWriteStream(inputPath);

    https.get(fileUrl, (response) => {

      response.pipe(fileStream);

      fileStream.on("finish", async () => {

        fileStream.close();

        try {

          // =========================
          // PDF TO IMAGE
          // =========================

          if (type === "pdf-to-img") {

            const outputDir =
              `temp/pdf_images_${Date.now()}`;

            fs.mkdirSync(outputDir);

            const opts = {
              format: "png",
              out_dir: outputDir,
              out_prefix: "page",
              page: null,
            };

            await pdfPoppler.convert(
              inputPath,
              opts
            );

            const files =
              fs.readdirSync(outputDir);

            for (const file of files) {

              const filePath =
                `${outputDir}/${file}`;

              await bot.sendDocument(
                chatId,
                filePath
              );

              fs.unlinkSync(filePath);
            }

            fs.rmdirSync(outputDir);

            fs.unlinkSync(inputPath);

            return;
          }

          // =========================
          // PDF TO TXT
          // =========================

          if (type === "pdf-to-txt") {

            const dataBuffer =
              fs.readFileSync(inputPath);

            const data =
              await pdfParse(dataBuffer);

            fs.writeFileSync(
              outputPath,
              data.text
            );

            await bot.sendDocument(
              chatId,
              outputPath
            );
          }

          // =========================
          // TXT TO PDF
          // =========================

          else if (type === "txt-to-pdf") {

            const text =
              fs.readFileSync(
                inputPath,
                "utf8"
              );

            const doc =
              new PDFDocument();

            const stream =
              fs.createWriteStream(outputPath);

            doc.pipe(stream);

            doc.text(text);

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
          // PDF TO HTML
          // =========================

          else if (type === "pdf-to-html") {

            const dataBuffer =
              fs.readFileSync(inputPath);

            const data =
              await pdfParse(dataBuffer);

            const html =
              `
              <html>
              <body>
              <pre>
              ${data.text}
              </pre>
              </body>
              </html>
              `;

            fs.writeFileSync(
              outputPath,
              html
            );

            await bot.sendDocument(
              chatId,
              outputPath
            );
          }

          // =========================
          // LIBREOFFICE CONVERSIONS
          // =========================

          else {

            const fileBuffer =
              fs.readFileSync(inputPath);

            let ext = ".pdf";

            if (
              type === "pdf-to-docx"
            ) {
              ext = ".docx";
            }

            else if (
              type === "docx-to-pdf"
            ) {
              ext = ".pdf";
            }

            libre.convert(
              fileBuffer,
              ext,
              undefined,
              async (err, done) => {

                if (err) {

                  console.log(err);

                  return bot.sendMessage(
                    chatId,
                    "Conversion failed."
                  );
                }

                fs.writeFileSync(
                  outputPath,
                  done
                );

                await bot.sendDocument(
                  chatId,
                  outputPath
                );

                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
              }
            );

            return;
          }

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);

        } catch (err) {

          console.log(err);

          bot.sendMessage(
            chatId,
            "PDF conversion failed."
          );
        }
      });
    });

  } catch (error) {

    console.log(error);

    bot.sendMessage(
      chatId,
      "Error processing PDF."
    );
  }
}

module.exports = {
  convertPdf,
};