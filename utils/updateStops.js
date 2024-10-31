import { query } from "./db.js";
import { _fetch } from "./utils.js";

export async function updateStops() {
  console.log("updating stops 0%");
  let url = "https://transit.ttc.com.ge/pis-gateway/api/v2/stops?locale=ka";
  let data = await _fetch(url);

  data = data.filter((r) => r.vehicleMode === "BUS");
  let values = [];
  for (let stop of data) {
    values.push(`('${stop.id}','${stop.name}', '${stop.lat}','${stop.lon}')`);
  }

  if (values.length === 0) return;
  await query(`
		truncate stops;
		INSERT INTO stops(stopID, name, lat, lon) VALUES ${values.join(",")}
		`);
  console.log("updating stops 100%");
}
