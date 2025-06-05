// src/liff-config.js

const liffConfig = {
  // デプロイ後、Vercel の環境変数で指定する LIFF ID
  liffId: process.env.REACT_APP_LIFF_ID,

  // デプロイ後、Vercel の環境変数で指定する WordPress REST API のベース URL
  // 例: "https://your-coreserver-domain.com/wp-json/line/v1"
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL
};

export default liffConfig;
