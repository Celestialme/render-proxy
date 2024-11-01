import { query } from "./db.js";
import { _fetch, sleep } from "./utils.js";

export async function updateSchedules(is_updating) {
  let routes = await query(` SELECT id,route FROM routes;`);
  let descriptionsValue = [];
  let schedulesValue = [];
  let index = 1;
  for (let r of routes) {
    if (is_updating.value === false) {
      console.log("Updating schedules interrupted");
      break;
    }
    is_updating.setLog(`Updating schedules ${Math.floor((index * 100) / routes.length)}%`);

    index++;
    let route = r.route;
    let busID = r.id;
    for (let forward of [0, 1]) {
      await sleep(5000);
      let description = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/routes/${busID}/scheme?forward=${forward}&locale=ka`);
      await sleep(5000);
      let schedule = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/routes/${busID}/schedule?forward=${forward}&locale=ka`);
      if (description) {
        description = description.map((d) => d["name"]).join(" > ");
        descriptionsValue.push(`('${route}','${description}','${forward}')`);
      }

      if (!schedule) continue;
      for (let weekdaySchedule of schedule.weekdaySchedules) {
        for (let stop of weekdaySchedule.stops) {
          schedulesValue.push(`('${route}','${weekdaySchedule.from_day}','${weekdaySchedule.to_day}','${stop.id.replaceAll("1:", "")}','${stop.arrivalTimes}','${forward}')`);
        }
      }
    }
  }

  if (schedulesValue.length != 0) {
    await query(`truncate schedules;`);
    await query(`INSERT INTO schedules(route,from_day,to_day,stop_id,arrival,forward) VALUES ${schedulesValue.join(",")};`);
  }
  if (descriptionsValue.length != 0) {
    await query(`truncate descriptions;`);
    await query(`INSERT INTO descriptions(route,description,forward) VALUES ${descriptionsValue.join(",")};`);
  }
}
