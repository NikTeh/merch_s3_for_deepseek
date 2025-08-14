require("dotenv").config();
const { Telegraf, Scenes, session, Markup } = require("telegraf");

const deptSupermarket = require("./handlers/dept_supermarket");
const deptPharma = require("./handlers/dept_pharma");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаём stage и подключаем сцены
const stage = new Scenes.Stage([deptSupermarket, deptPharma]);

bot.use(session());
bot.use(stage.middleware());

// Хранилище паролей (можно вынести в базу)
const PASSWORD  = process.env.BOT_LOGIN_KEY;

// Команда /start — запрос пароля
bot.start((ctx) => {
    ctx.reply("Введите 4-значный пароль для входа:");
    ctx.session.authenticated = false;
});

// Обработка всех сообщений
bot.on("text", async (ctx, next) => {
    if (!ctx.session.authenticated) {
        if (ctx.message.text === PASSWORD) {
            ctx.session.authenticated = true;
            return ctx.reply(
                "Пароль верный. Выберите отдел:",
                Markup.inlineKeyboard([
                    [Markup.button.callback("🏬 Магазины", "dept_supermarket")],
                    [Markup.button.callback("💊 Аптеки", "dept_pharma")]
                ])
            );
        } else {
            return ctx.reply("Неверный пароль, попробуйте ещё раз:");
        }
    }
    return next();
});

// Выбор отдела
bot.action("dept_supermarket", (ctx) => {
    ctx.deleteMessage(); // удаляем кнопки
    ctx.scene.enter("dept_supermarket");
});

bot.action("dept_pharma", (ctx) => {
    ctx.deleteMessage(); // удаляем кнопки
    ctx.scene.enter("dept_pharma");
});

// Запуск бота
try {
    bot.launch(() => {
        console.log("✅ Бот запущен и готов к работе");
    });
} catch (error) {
    console.error("Ошибка запуска бота:", error);
}

// Остановка бота
process.once("SIGINT", () => {
    console.log("⛔ Бот остановлен (SIGINT)");
    bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
    console.log("⛔ Бот остановлен (SIGTERM)");
    bot.stop("SIGTERM");
});
