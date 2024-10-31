import express from "express";
import { updateLines } from "./utils/updateLines.js";
import { updateRoutes } from "./utils/updateRoutes.js";
import { updateSchedules } from "./utils/updateSchedules.js";
import { updateStops } from "./utils/updateStops.js";
import { _fetch } from "./utils/utils.js";
const app = express();
const port = process.env.PORT || 3000;

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
  let run = async () => {
    await updateRoutes();
    await updateStops();
    await updateLines();
    await updateSchedules();
  };
  run();
});
let server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
