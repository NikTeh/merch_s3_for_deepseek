const photoHandler = require('../utils/photoHandler');
const { Scenes, Markup } = require("telegraf");
const db = require("../services/db");

const deptPharmaScene = new Scenes.WizardScene(
  "dept_pharma",
  async (ctx) => {
    ctx.session.report = {};
    await ctx.reply("Укажите дату отчёта (в формате ГГГГ-ММ-ДД):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.report.report_date = ctx.message.text;
    await ctx.reply("Укажите ваше имя:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.report.merch_name = ctx.message.text;
    await ctx.reply("Укажите ваш телефон:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.report.merch_phone = ctx.message.text;
    await ctx.reply(
      "Товар есть в аптеке?",
      Markup.keyboard([["ДА", "НЕТ"]]).resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.report.product_exists = ctx.message.text.toUpperCase() === "ДА";
    await ctx.reply(
      "Товар компании участвует в промо в аптеке?",
      Markup.keyboard([["Стойка", "Цена", "Рекомендации"]]).resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.report.promo_type = ctx.message.text;
    await ctx.reply(
      "Отправьте геопозицию аптеки",
      Markup.keyboard([
        Markup.button.locationRequest("📍 Отправить геопозицию"),
      ]).resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.location) {
      await ctx.reply("Пожалуйста, отправьте геопозицию через кнопку.");
      return;
    }
    ctx.session.report.latitude = ctx.message.location.latitude;
    ctx.session.report.longitude = ctx.message.location.longitude;
    await ctx.reply("Отправьте фото товара в аптеке", Markup.removeKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.photo) {
      await ctx.reply("Пожалуйста, отправьте фото.");
      return;
    }
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    ctx.session.report.photo_url = fileLink.href;

      try {
    // Добавляем обработку фото для S3
    ctx.session.report.s3_url = await photoHandler.processPhoto(fileLink.href);
  } catch (error) {
    console.error('Failed to upload to S3:', error);
    // Продолжаем работу даже если S3 не доступен
    ctx.session.report.s3_url = null;
  }

    await ctx.reply(
      "Отправить отчёт?",
      Markup.keyboard([["ДА", "НЕТ"]]).resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message.text === "ДА") {
      try {

const query = `
  INSERT INTO reports_b
    (report_date, merch_name, merch_phone, product_exists, promo_type, latitude, longitude, photo_url, s3_url)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
`;
        const values = [
          ctx.session.report.report_date,
          ctx.session.report.merch_name,
          ctx.session.report.merch_phone,
          ctx.session.report.product_exists,
          ctx.session.report.promo_type,
          ctx.session.report.latitude,
          ctx.session.report.longitude,
          ctx.session.report.photo_url,
          ctx.session.report.s3_url
        ];
        await db.query(query, values);
        await ctx.reply("✅ Отчёт отправлен!", Markup.removeKeyboard());
      } catch (err) {
        console.error("Ошибка записи в БД:", err);
        await ctx.reply(
          "❌ Ошибка при отправке отчёта.",
          Markup.removeKeyboard()
        );
      }
    } else {
      await ctx.reply("❌ Отправка отменена.", Markup.removeKeyboard());
    }
    return ctx.scene.leave();
  }
);

module.exports = deptPharmaScene;
