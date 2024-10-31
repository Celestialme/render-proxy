import express from "express";
import { updateLines } from "./utils/updateLines.js";
import { updateRoutes } from "./utils/updateRoutes.js";
import { updateSchedules } from "./utils/updateSchedules.js";
import { updateStops } from "./utils/updateStops.js";
import { _fetch } from "./utils/utils.js";
const app = express();
const port = process.env.PORT || 3000;
let is_updating = {
  value: false,
};
app.get("/", async (req, res) => {
  var url = "https://transit.ttc.com.ge/pis-gateway/api/v2/routes?modes=BUS";
  const data = await _fetch(url);
  if (!data) {
    res.send("Something went wrong");
    return;
  }

  res.send(JSON.stringify(data));
});
app.get("/update", async (req, res) => {
  if (is_updating.value) {
    res.send("Updating in progress");
    return;
  }
  is_updating.value = true;
  let run = async () => {
    let functions = [updateRoutes, updateStops, updateLines, updateSchedules];
    for (let f of functions) {
      if (is_updating.value === false) {
        console.log("Update interrupted");
        break;
      }
      await f(is_updating);
    }
    is_updating.value = false;
  };
  run();
  res.send("Update started");
});

app.get("/stop", async (req, res) => {
  is_updating.value = false;
  res.send("Update stopped");
});

let server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
