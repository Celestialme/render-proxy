import { query } from "./db.js";
import { _fetch } from "./utils.js";

export async function updateRoutes() {
  console.log("updating routes 0%");
  let url = "https://transit.ttc.com.ge/pis-gateway/api/v2/routes?modes=BUS";
  const data = await _fetch(url);

  let values = [];
  for (let route of data) {
    values.push(`('${route.id}','${route.shortName}', '${route.longName}')`);
  }
  if (values.length === 0) return;
  await query(`
    truncate routes;
    INSERT INTO routes(id,route,name) VALUES ${values.join(",")};
    `);
  console.log("updating routes 100%");
}
