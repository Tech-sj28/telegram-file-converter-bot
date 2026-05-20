require("dotenv").config();

const TelegramBot =
  require("node-telegram-bot-api");

const {
  convertImage,
} = require("./converters/image");

const {
  convertPdf,
} = require("./converters/pdf");

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  {
    polling: true,
  }
);

console.log("Bot Running...");

// Store user selected conversion
const userConversionType = {};

// =========================
// START COMMAND
// =========================

bot.onText(/\/start/, (msg) => {

  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Welcome to File Converter Bot 🚀\n\nChoose category:",
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🖼️ Image Converter",
              callback_data: "image-menu",
            },
          ],

          [
            {
              text: "📄 File Converter",
              callback_data: "file-menu",
            },
          ],

        ],
      },
    }
  );
});

// =========================
// BUTTON HANDLER
// =========================

bot.on("callback_query", async (query) => {

  const chatId =
    query.message.chat.id;

  const data = query.data;

  // =========================
  // IMAGE MENU
  // =========================

  if (data === "image-menu") {

    return bot.sendMessage(
      chatId,
      "Choose Image Conversion:",
      {
        reply_markup: {
          inline_keyboard: [

            [
              {
                text: "JPG ➜ PNG",
                callback_data: "png",
              },
            ],

            [
              {
                text: "PNG ➜ JPG",
                callback_data: "jpg",
              },
            ],

            [
              {
                text: "WEBP ➜ PNG",
                callback_data: "png",
              },
            ],

            [
              {
                text: "Image ➜ WEBP",
                callback_data: "webp",
              },
            ],

            [
              {
                text: "Image ➜ AVIF",
                callback_data: "avif",
              },
            ],

            [
              {
                text: "WEBP ➜ GIF",
                callback_data: "gif",
              },
            ],
            [
              {
                text: "IMAGE ➜ PDF",
                callback_data: "img-to-pdf",
              },
            ],
            

          ],
        },
      }
    );
  }

  // =========================
  // FILE MENU
  // =========================

  if (data === "file-menu") {

    return bot.sendMessage(
      chatId,
      "Choose File Conversion:",
      {
        reply_markup: {
          inline_keyboard: [

            [
              {
                text: "PDF ➜ WORD",
                callback_data: "pdf-to-docx",
              },
            ],
          
            [
              {
                text: "WORD ➜ PDF",
                callback_data: "docx-to-pdf",
              },
            ],
          
            [
              {
                text: "PDF ➜ TXT",
                callback_data: "pdf-to-txt",
              },
            ],
          
            [
              {
                text: "TXT ➜ PDF",
                callback_data: "txt-to-pdf",
              },
            ],
          
            [
              {
                text: "PDF ➜ HTML",
                callback_data: "pdf-to-html",
              },
            ],
            [
              {
                text: "PDF ➜ IMAGE",
                callback_data: "pdf-to-img",
              },
            ],
          
            
          
          ],
        },
      }
    );
  }

  // =========================
  // SAVE USER SELECTION
  // =========================

  userConversionType[chatId] = data;

  bot.sendMessage(
    chatId,
    `Now send file for conversion:\n\nSelected: ${data.toUpperCase()}`
  );
});

// =========================
// PHOTO HANDLER
// =========================

bot.on("photo", async (msg) => {

  const chatId = msg.chat.id;

  const format =
    userConversionType[chatId];

  if (!format) {

    return bot.sendMessage(
      chatId,
      "Use /start first."
    );
  }

  const photo =
    msg.photo[msg.photo.length - 1];

  bot.sendMessage(
    chatId,
    "Converting image..."
  );

  convertImage(
    bot,
    photo.file_id,
    chatId,
    process.env.BOT_TOKEN,
    format
  );
});

// =========================
// DOCUMENT HANDLER
// =========================

bot.on("document", async (msg) => {

  const chatId = msg.chat.id;

  const format =
    userConversionType[chatId];

  if (!format) {

    return bot.sendMessage(
      chatId,
      "Use /start first."
    );
  }

  const document = msg.document;

  const mimeType =
    document.mime_type;

  // =========================
  // IMAGE CONVERSION
  // =========================

  if (
    mimeType.startsWith("image/")
  ) {

    bot.sendMessage(
      chatId,
      "Converting image..."
    );

    convertImage(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }

  // =========================
  // PDF ➜ WORD
  // =========================

  else if (
    format === "pdf-to-docx" &&
    mimeType === "application/pdf"
  ) {

    bot.sendMessage(
      chatId,
      "Converting PDF to Word..."
    );

    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }

  // =========================
  // WORD ➜ PDF
  // =========================

  else if (
    format === "docx-to-pdf" &&
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {

    bot.sendMessage(
      chatId,
      "Converting Word to PDF..."
    );

    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }
  else if (
    format === "pdf-to-img" &&
    mimeType === "application/pdf"
  ) {
  
    bot.sendMessage(
      chatId,
      "Converting PDF to Images..."
    );
  
    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }
  // =========================
  // INVALID FILE
  // =========================
  else if (
    format === "pdf-to-txt" &&
    mimeType === "application/pdf"
  ) {
  
    bot.sendMessage(
      chatId,
      "Converting PDF to TXT..."
    );
  
    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }
    
  else if (
    format === "txt-to-pdf" &&
    mimeType === "text/plain"
  ) {
  
    bot.sendMessage(
      chatId,
      "Converting TXT to PDF..."
    );
  
    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }
    
  else if (
    format === "pdf-to-html" &&
    mimeType === "application/pdf"
  ) {
  
    bot.sendMessage(
      chatId,
      "Converting PDF to HTML..."
    );
  
    convertPdf(
      bot,
      document.file_id,
      chatId,
      process.env.BOT_TOKEN,
      format
    );
  }
   
  else {

    bot.sendMessage(
      chatId,
      "Invalid file type."
    );
  }
});