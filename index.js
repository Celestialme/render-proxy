import express from "express";
import { updateLines } from "./utils/updateLines.js";
import { updateRoutes } from "./utils/updateRoutes.js";
import { updateSchedules } from "./utils/updateSchedules.js";
import { updateStops } from "./utils/updateStops.js";
import { _fetch } from "./utils/utils.js";
import { query } from "./utils/db.js";
const app = express();
const port = process.env.PORT || 3000;
let interval;
let is_updating = {
  value: false,
  log: "",
  setLog: (log) => {
    is_updating.log = log;
    console.log(log);
  },
};
app.get("/", async (req, res) => {
  res.send("Service status OK!");
});

app.get("/db", async (req, res) => {
  let type = req.query.type;

  let data = await query(`SELECT json_agg(${type}) FROM ${type}`);

  if (!data) {
    res.status(500).send("Something went wrong");
  } else {
    res.send(JSON.stringify(data[0].json_agg));
  }
});

app.get("/arrival", async (req, res) => {
  let stopId = req.query.stopId;
  let data = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/stops/1:${stopId}/arrival-times?locale=ka&ignoreScheduledArrivalTimes=true`);

  if (!data) {
    res.status(500).send("Something went wrong");
    return;
  } else {
    res.send(JSON.stringify(data));
  }
});
app.get("/plan", async (req, res) => {
  let fromPlace = req.query.fromPlace;
  let toPlace = req.query.toPlace;
  let modes = req.query.modes;
  let optimize = req.query.optimize;
  let data = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/plan?fromPlace=${fromPlace}&toPlace=${toPlace}&departMode=leaveNow&modes=${modes}&optimize=${optimize}&locale=ka`);

  if (!data) {
    res.status(500).send("Something went wrong");
    return;
  } else {
    res.send(JSON.stringify(data));
  }
});
app.get("/busLocation", async (req, res) => {
  let route = req.query.route;
  let forward = req.query.forward;
  let data = await _fetch(`https://transit.ttc.com.ge/pis-gateway/api/v2/routes/${route}/positions?forward=${forward}`);
  if (!data) {
    res.status(500).send("Something went wrong");
    return;
  } else {
    res.send(JSON.stringify(data));
  }
});

app.get("/update", async (req, res) => {
  if (is_updating.value === true) {
    res.send("update in progress \n" + is_updating.log);
    return;
  }
  is_updating.value = true;

  startUpdate();
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

app.get("/sleepoff", async (req, res) => {
  sleepoff();

  res.send("sleep is off");
});

app.get("/sleepon", async (req, res) => {
  interval && clearInterval(interval);
  interval = undefined;
  res.send("sleep is on");
});

let server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

function sleepoff() {
  interval && clearInterval(interval);
  interval = setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL}/ping`);
  }, 780000);
}

async function startUpdate() {
  sleepoff();
  let updaters = [updateRoutes, updateStops, updateLines, updateSchedules];
  for (let update of updaters) {
    if (is_updating.value === false) {
      console.log("Update interrupted");
      break;
    }
    await update(is_updating);
  }
  is_updating.value = false;
}
