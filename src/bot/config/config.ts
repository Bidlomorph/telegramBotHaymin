import { config } from 'dotenv';
import * as path from 'path';
const appDir = path.dirname(require.main.filename);
config();

export default {
  bot: {
    token: process.env.BOT_TOKEN,
    amountOfTries: 10,
    wrongAnswersToFail: 4,
  },
};
