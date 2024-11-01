import { query } from "./db.js";
import { _fetch, sleep } from "./utils.js";

let index = 1;
export async function updateLines(is_updating) {
  let routes = await query(`SELECT id,route FROM routes;`);
  let values = [];
  for (let r of routes) {
    if (is_updating.value === false) {
      console.log("Updating lines interrupted");
      break;
    }
    is_updating.setLog(`Updating polylines ${Math.floor((index * 100) / routes.length)}%`);

    index++;
    let route = r.route;
    let busID = r.id;
    for (let forward of [0, 1]) {
      await sleep(5000);
      let data = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/routes/${busID}/polyline?forward=${forward}`);
      if (!data) continue;

      let polyline = data.encodedValue;

      values.push(`('${route}','${forward}','${polyline}')`);
    }
  }
  if (values.length === 0) return;
  await query("truncate lines;");
  await query(`INSERT INTO lines(route,forward,polyline) VALUES ${values.join(",")}`);
}
