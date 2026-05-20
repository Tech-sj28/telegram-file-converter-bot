require("dotenv").config();

const TelegramBot =
  require("node-telegram-bot-api");

const {
  convertImage,
} = require("./converters/image");

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
    "Welcome to Image Converter Bot 🚀\n\nChoose conversion category:",
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🖼️ Image Converter",
              callback_data: "image-menu",
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
                text: "IMAGE ➜ WEBP",
                callback_data: "webp",
              },
            ],

            [
              {
                text: "IMAGE ➜ AVIF",
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
  // SAVE USER SELECTION
  // =========================

  userConversionType[chatId] = data;

  bot.sendMessage(
    chatId,
    `Now send image for conversion.\n\nSelected: ${data.toUpperCase()}`
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
      "Please use /start first."
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
      "Please use /start first."
    );
  }

  const document = msg.document;

  const mimeType =
    document.mime_type;

  // =========================
  // IMAGE CONVERSION
  // =========================

  if (
    mimeType &&
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
  // INVALID FILE
  // =========================

  else {

    bot.sendMessage(
      chatId,
      "Only image files are supported."
    );
  }
});


bot.onText(/\/help/, (msg) => {

  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `
📌 Available Features

🖼️ JPG ➜ PNG
🖼️ PNG ➜ JPG
🖼️ WEBP ➜ PNG
🎞️ WEBP ➜ GIF
📄 IMAGE ➜ PDF
✨ IMAGE ➜ AVIF

Use /start to begin.
`
  );
});

bot.onText(/\/image/, (msg) => {

  const chatId = msg.chat.id;

  bot.sendMessage(
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
              text: "IMAGE ➜ WEBP",
              callback_data: "webp",
            },
          ],

          [
            {
              text: "IMAGE ➜ AVIF",
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
});

// =========================
// KEEP RENDER ALIVE
// =========================

const http = require("http");

http
  .createServer((req, res) => {

    res.write("Bot Running");

    res.end();

  })
  .listen(process.env.PORT || 10000);