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
  log: "",
  setLog: (log) => {
    is_updating.log = log;
    console.log(log);
  },
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
  if (is_updating.value === true) {
    res.send("Updating in progress \n" + is_updating.log);
    return;
  }
  is_updating.value = true;
  let run = async () => {
    let interval = setInterval(() => {
      fetch(`https://render-proxy-1-i5fu.onrender.com/ping`);
    }, 780000);
    let updaters = [updateRoutes, updateStops, updateLines, updateSchedules];
    for (let update of updaters) {
      if (is_updating.value === false) {
        console.log("Update interrupted");
        break;
      }
      await update(is_updating);
    }
    is_updating.value = false;
    clearInterval(interval);
  };
  run();
  res.send("Update started");
});

app.get("/stop", async (req, res) => {
  is_updating.value = false;
  res.send("Update stopped");
});
app.get("/ping", async (req, res) => {
  console.log("service is alive");
  res.send("service is alive");
});

let server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
