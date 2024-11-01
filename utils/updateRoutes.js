import { query } from "./db.js";
import { _fetch } from "./utils.js";

export async function updateRoutes(is_updating) {
  is_updating.setLog("updating routes 0%");
  let url = "https://transit.ttc.com.ge/pis-gateway/api/v2/routes?modes=BUS";
  const data = await _fetch(url);
  if (!data) {
    is_updating.setLog("Something went wrong");
    return;
  }

  let values = [];
  for (let route of data) {
    values.push(`('${route.id}','${route.shortName}', '${route.longName}')`);
  }
  if (values.length === 0) return;

  await query(`truncate routes;`);
  await query(`
    INSERT INTO routes(id,route,name) VALUES ${values.join(",")};
    `);

  is_updating.setLog("updating routes 100%");
}
