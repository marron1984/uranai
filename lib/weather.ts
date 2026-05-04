// 大阪天気取得（Open-Meteo / API キー不要）
// https://api.open-meteo.com/v1/forecast

export type WeatherData = {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKmh: number;
  weatherCode: number;
  desc: string;
  icon: string;
  updatedAt: string;
};

// WMO 気象コード → 日本語＋アイコン
const WMO: Record<number, { desc: string; icon: string }> = {
  0:  { desc: "快晴",       icon: "☀️" },
  1:  { desc: "晴れ",       icon: "🌤" },
  2:  { desc: "晴れ時々曇り", icon: "⛅" },
  3:  { desc: "曇り",       icon: "☁️" },
  45: { desc: "霧",         icon: "🌫" },
  48: { desc: "霧氷",       icon: "🌫" },
  51: { desc: "霧雨（弱）", icon: "🌦" },
  53: { desc: "霧雨",       icon: "🌦" },
  55: { desc: "霧雨（強）", icon: "🌧" },
  56: { desc: "凍る霧雨",   icon: "🌨" },
  57: { desc: "凍る霧雨",   icon: "🌨" },
  61: { desc: "小雨",       icon: "🌦" },
  63: { desc: "雨",         icon: "🌧" },
  65: { desc: "強い雨",     icon: "🌧" },
  66: { desc: "凍雨",       icon: "🌨" },
  67: { desc: "凍雨",       icon: "🌨" },
  71: { desc: "小雪",       icon: "🌨" },
  73: { desc: "雪",         icon: "❄️" },
  75: { desc: "大雪",       icon: "❄️" },
  77: { desc: "霧雪",       icon: "🌨" },
  80: { desc: "にわか雨",   icon: "🌦" },
  81: { desc: "強いにわか雨", icon: "🌧" },
  82: { desc: "猛烈なにわか雨", icon: "⛈" },
  85: { desc: "にわか雪",   icon: "🌨" },
  86: { desc: "強いにわか雪", icon: "❄️" },
  95: { desc: "雷雨",       icon: "⛈" },
  96: { desc: "雷雨と雹",   icon: "⛈" },
  99: { desc: "激しい雷雨", icon: "⛈" },
};

export async function fetchOsakaWeather(): Promise<WeatherData> {
  // 大阪市（吉田さん出生地：北緯34.69 / 東経135.54）
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=34.69&longitude=135.54" +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&timezone=Asia%2FTokyo";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("weather fetch failed");
  const json = await res.json();
  const c = json.current;
  const code = c.weather_code as number;
  const meta = WMO[code] ?? { desc: `天気コード${code}`, icon: "🌡" };
  return {
    tempC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windKmh: c.wind_speed_10m,
    weatherCode: code,
    desc: meta.desc,
    icon: meta.icon,
    updatedAt: c.time,
  };
}
