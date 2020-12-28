/*eslint-ingore*/

import * as Hapi from '@hapi/hapi';
import * as Basic from '@hapi/basic';
import config from './config/config';
import { Telegraf } from 'telegraf';
import { MenuTemplate, MenuMiddleware } from 'telegraf-inline-menu';

import chalk = require('chalk');
import { TelegrafContext } from 'telegraf/typings/context';
import { reset } from 'chalk';

const init = async () => {
  // Server start-up
  try {
    const bot = new Telegraf(config.bot.token);

    let chatId: number;
    let aftermatch: boolean = false;
    let from: number, to: number, task: any;
    let right: number = 0,
      wrongAnswers: Array<string> = [],
      wrong: number = 0;
    let currentTry = 0;

    let botStart = false;

    const botReset = () => {
      right = 0;
      wrongAnswers = [];
      wrong = 0;
      currentTry = 0;
      aftermatch = false;
    };

    const generateTask = (ctx: TelegrafContext) => {
      task = Math.round(10 + Math.random() * 100 * (currentTry + 1));
      let taskConverted = task.toString(from);
      console.log(Number(task).toString(to));
      currentTry += 1;
      setTimeout(() => {
        ctx.reply(`Переведите число: ${taskConverted} в ${to}-чную`);
      }, 1000);
    };

    const checkAnswer = (ctx: TelegrafContext, aftermatch?: boolean) => {
      let formatted = Number.parseInt(ctx.message.text, to);
      let answer = aftermatch ? formatted === Number(wrongAnswers[wrongAnswers.length - 1]) : formatted === task;

      if (answer) {
        right += 1;
        console.log(aftermatch);
        if (aftermatch) wrongAnswers.pop();
        return ctx.reply('✅');
      } else {
        wrong += 1;
        if (!aftermatch) wrongAnswers.push(task);
        return ctx.reply('❌');
      }
    };

    const outputResult = () => {
      bot.telegram.sendMessage(chatId, 'Тест окончен. Ваши результаты ⤵️');
      bot.telegram.sendMessage(chatId, `Правильных ответов: ${right}, неверных: ${wrong}`);
      if (wrong > config.bot.wrongAnswersToFail)
        setTimeout(() => {
          bot.telegram.sendMessage(chatId, `Тест не пройден! 📕`);
        }, 1000);
      else {
        setTimeout(() => {
          bot.telegram.sendMessage(chatId, `Тест пройден! 📗`);
        }, 1000);

        botReset();
      }
      botStart = false;
      aftermatch = false;
    };

    const askWrongAgain = (ctx: TelegrafContext) => {
      if (wrongAnswers.length == 0) {
        outputResult();
      } else {
        console.log(Number(wrongAnswers[wrongAnswers.length - 1]).toString(to));
        setTimeout(() => {
          ctx.reply(`У вас есть неправильные ответы (${wrongAnswers.length})`);
          setTimeout(() => {
            ctx.reply(`Переведите число: ${Number(wrongAnswers[wrongAnswers.length - 1]).toString(from)} в ${to}-чную`);
          }, 100);
        }, 500);
      }
    };

    bot.start(async (ctx) => {
      ctx.reply('Здравствуйте! Ознакомьтесь с данным документом и выберите вариант теста для прохождения ⬇️');
      await bot.telegram.sendDocument(ctx.chat.id, { source: './src/files/doc.pdf' });
      setTimeout(() => {
        ctx.reply('Используйте /menu для начала теста 📘');
      }, 2000);
    });

    bot.command('menu', (ctx) =>
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант теста', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ Из 2-ичной', callback_data: 's2' }],
            [{ text: '▶️ Из 8-ичной', callback_data: 's8' }],
            [{ text: '▶️ Из 10-ичной', callback_data: 's10' }],
            [{ text: '▶️ Из 16-ичной', callback_data: 's16' }],
          ],
        },
      })
    );

    bot.action('tomenu', (ctx) =>
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант исходной системы', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ Из 2-ичной', callback_data: 's2' }],
            [{ text: '▶️ Из 8-ичной', callback_data: 's8' }],
            [{ text: '▶️ Из 10-ичной', callback_data: 's10' }],
            [{ text: '▶️ Из 16-ичной', callback_data: 's16' }],
          ],
        },
      })
    );

    bot.action('s2', (ctx) => {
      from = 2;
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант конечной системы', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ В 8-ичную', callback_data: 't8' }],
            [{ text: '▶️ В 10-ичную', callback_data: 't10' }],
            [{ text: '▶️ В 16-ичную', callback_data: 't16' }],
            [{ text: '↩️ В начало', callback_data: 'tomenu' }],
          ],
        },
      });
    });

    bot.action('s8', (ctx) => {
      from = 8;
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант конечной системы', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ В 2-ичную', callback_data: 't2' }],
            [{ text: '▶️ В 10-ичную', callback_data: 't10' }],
            [{ text: '▶️ В 16-ичную', callback_data: 't16' }],
            [{ text: '↩️ В начало', callback_data: 'tomenu' }],
          ],
        },
      });
    });

    bot.action('s10', (ctx) => {
      from = 10;
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант конечной системы', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ В 2-ичную', callback_data: 't2' }],
            [{ text: '▶️ В 3-ичную', callback_data: 't3' }],
            [{ text: '▶️ В 4-ичную', callback_data: 't4' }],
            [{ text: '▶️ В 5-ичную', callback_data: 't5' }],
            [{ text: '▶️ В 6-ичную', callback_data: 't6' }],
            [{ text: '▶️ В 7-ичную', callback_data: 't7' }],
            [{ text: '▶️ В 8-ичную', callback_data: 't8' }],
            [{ text: '▶️ В 16-ичную', callback_data: 't16' }],
            [{ text: '↩️ В начало', callback_data: 'tomenu' }],
          ],
        },
      });
    });

    bot.action('s16', (ctx) => {
      from = 16;
      ctx.telegram.sendMessage(ctx.chat.id, 'Выберите вариант конечной системы', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '▶️ В 2-ичную', callback_data: 't2' }],
            [{ text: '▶️ В 8-ичную', callback_data: 't8' }],
            [{ text: '▶️ В 10-ичную', callback_data: 't10' }],
            [{ text: '↩️ В начало', callback_data: 'tomenu' }],
          ],
        },
      });
    });

    bot.action('t2', (ctx) => {
      to = 2;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t3', (ctx) => {
      to = 3;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t4', (ctx) => {
      to = 4;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t5', (ctx) => {
      to = 5;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t6', (ctx) => {
      to = 6;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t7', (ctx) => {
      to = 7;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t8', (ctx) => {
      to = 8;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t10', (ctx) => {
      to = 10;
      generateTask(ctx);
      botStart = true;
    });

    bot.action('t16', (ctx) => {
      to = 16;
      generateTask(ctx);
      botStart = true;
    });

    bot.on('message', async (ctx) => {
      if (!botStart) return ctx.reply('Используйте /menu для начала теста 📘');
      if (!chatId) chatId = ctx.message.chat.id;
      //if (Number.isNaN(Number(ctx.message.text))) return ctx.reply('Я не понял, что вы сказали. Вы точно написали число?');
      checkAnswer(ctx, aftermatch);
      console.log(currentTry);
      if (currentTry >= config.bot.amountOfTries) {
        aftermatch = true;
        return askWrongAgain(ctx);
      }
      generateTask(ctx);
      console.log('RIGHT ' + right + '  WRONG ' + wrongAnswers.length);
    });

    bot.action('s8', (ctx) => {
      ctx.reply('Из двоичной');
      from = 8;
    });

    bot.action('s10', (ctx) => {
      ctx.reply('Из двоичной');
      from = 10;
    });

    bot.action('s16', (ctx) => {
      ctx.reply('Из двоичной');
      from = 16;
    });

    bot.launch();
    console.log(chalk.bgGreen(chalk.black(`Bot is running`)));
  } catch (err) {
    console.log(chalk.bgRed(chalk.black(JSON.stringify(err))));
  }
};

export { init };
