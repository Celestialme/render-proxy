import { query } from "./db.js";
import { _fetch } from "./utils.js";

export async function updateStops(is_updating) {
  is_updating.setLog("updating stops 0%");
  let url = "https://transit.ttc.com.ge/pis-gateway/api/v2/stops?locale=ka";
  let data = await _fetch(url);
  if (!data) {
    is_updating.setLog("Something went wrong");
    return;
  }

  data = data.filter((r) => r.vehicleMode === "BUS");
  let values = [];
  for (let stop of data) {
    values.push(`('${stop.code}','${stop.name}', '${stop.lat}','${stop.lon}')`);
  }

  if (values.length === 0) return;
  await query(`truncate stops;`);
  await query(`
		INSERT INTO stops(stop_id, name, lat, lon) VALUES ${values.join(",")}
		`);

  is_updating.setLog("updating stops 100%");
}
