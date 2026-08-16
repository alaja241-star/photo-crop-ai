export const emailConfig = {
  smtp: {
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'agriai',
      pass: 'password'
    }
  },
  sender: {
    email: 'yussif@oji.one',
    name: 'AgriAI'
  },
  app: {
    name: 'AgriAI',
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};
