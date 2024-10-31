import { query } from "./db.js";
import { _fetch, sleep } from "./utils.js";

let index = 1;
export async function updateLines() {
  let routes = await query(` SELECT id,route FROM routes;`);
  let values = [];
  for (let r of routes) {
    console.log(`updating polylines ${Math.floor((index * 100) / routes.length)}%`);
    index++;
    let route = r.route;
    let busID = r.id;
    for (let forward of [0, 1]) {
      let data = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/routes/${busID}/polyline?forward=${forward}`);
      if (!data) continue;

      let polyline = data.encodedValue;

      values.push(`('${route}','${forward}','${polyline}')`);
      await sleep(5000);
    }
  }
  if (values.length === 0) return;
  await query(`
    truncate lines;
    INSERT INTO lines(route,forward,polyline) VALUES ${values.join(",")}`);
}
