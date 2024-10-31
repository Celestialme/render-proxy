import { query } from "./db.js";
import { _fetch, sleep } from "./utils.js";

export async function updateSchedules() {
  let routes = await query(` SELECT id,route FROM routes;`);
  let descriptionsValue = [];
  let schedulesValue = [];
  let index = 1;
  for (let r of routes) {
    console.log(`updating schedules ${Math.floor((index * 100) / routes.length)}%`);
    index++;
    let route = r.route;
    let busID = r.id;
    for (let forward of [0, 1]) {
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
          schedulesValue.push(`('${route}','${weekdaySchedule.fromDay}','${weekdaySchedule.toDay}','${stop.id.replaceAll("1:", "")}','${stop.arrivalTimes}','${forward}')`);
        }
      }
      await sleep(5000);
    }
  }

  await query(`
    ${
      schedulesValue.length !== 0
        ? `
        truncate schedules;
        INSERT INTO schedules(route,fromDay,toDay,stopID,arrival,forward) VALUES ${schedulesValue.join(",")};
        `
        : ""
    }
    ${
      descriptionsValue.length !== 0
        ? `
        truncate descriptions;
        INSERT INTO descriptions(route,description,forward) VALUES ${descriptionsValue.join(",")};
        `
        : ""
    }
    `);
}
