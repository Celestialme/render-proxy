import express from "express";
import { updateLines } from "./utils/updateLines.js";
import { updateRoutes } from "./utils/updateRoutes.js";
import { updateSchedules } from "./utils/updateSchedules.js";
import { updateStops } from "./utils/updateStops.js";
import { _fetch } from "./utils/utils.js";
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
