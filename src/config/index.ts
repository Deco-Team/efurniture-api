/**
 * ENV
 */
export default () => ({
  mongodbUrl: process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/efurniture',
  mail: {
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: Number(process.env.SMTP_PORT || 465),
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_SECURE: process.env.SMTP_SECURE !== 'false',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'SMTP_FROM_NAME'
  },
  payment: {
    momo: {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT
    },
    zalopay: {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT
    },
    payos: {
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    },
  },
  discord: {
    webhookId: process.env.DISCORD_WEBHOOK_ID,
    webhookToken: process.env.DISCORD_WEBHOOK_TOKEN,
  },
  tripo3dAI: {
    endpoint: process.env.TRIPO_3D_AI_ENDPOINT,
    apiKey: process.env.TRIPO_3D_AI_API_KEY
  },
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'accessSecret',
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || 864000, // seconds
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
  JWT_REFRESH_EXPIRATION: Number(process.env.JWT_REFRESH_EXPIRATION) || 90, // 90 days
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  WEB_URL: process.env.WEB_URL || 'https://www.furnique.tech',
  SERVER_URL: process.env.SERVER_URL || 'https://api.furnique.tech'
})

export const AuthRoles = {
  CUSTOMER: 'CUSTOMER',
  USER: 'user'
}

export const Sides = {
  CUSTOMER: 'customer',
  USER: 'user'
}

/**
 * REGEX
 */
export const EMAIL_REGEX = /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i
export const PHONE_REGEX = /^(?:$|^[+]?\d{10,12}$)/ // empty or format
export const URL_REGEX =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi

export const VN_TIMEZONE = 'Asia/Tokyo'
