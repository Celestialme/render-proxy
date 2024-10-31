export async function _fetch(url) {
  return new Promise(async (resolve, reject) => {
    let resp = await fetch(url, { headers });
    if (resp.status !== 200) {
      resolve(null);
    } else {
      resolve(await resp.json());
    }
  });
}

export let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const apiKey = "c0a2f304-551a-4d08-b8df-2c53ecd57f9f";
let headers = {
  accept: "application/json, text/plain, */*",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "en-US,en;q=0.9,ka;q=0.8",
  "cache-control": "no-cache",
  connection: "keep-alive",
  cookie: "cookiesession1=678A3E12124B418F627EF9CBA9DDF76F; _ga=GA1.1.346847782.1719165433; _ga_XKN7FJ75X8=GS1.1.1730205977.22.1.1730205983.0.0.0",
  host: "transit.ttc.com.ge",
  pragma: "no-cache",
  referer: "https://transit.ttc.com.ge/",
  "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "Windows",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "x-api-key": apiKey,
};
