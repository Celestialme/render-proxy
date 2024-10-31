import { query } from "./utils/db.js";
import fs from "fs";
// const res = await query("SELECT json_agg(schedules) FROM schedules");
// fs.writeFileSync("output.json", JSON.stringify(res[0].json_agg, null, 2));

console.log(
  await query(`
    SELECT * from stops LIMIT 1;
    `)
);
