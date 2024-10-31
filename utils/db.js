import pg from "pg";

export async function query(sql) {
  let client = new pg.Client("postgres://default:Mk0afnDrQ9Ag@ep-crimson-lake-a2qqsekn.eu-central-1.aws.neon.tech:5432/verceldb?sslmode=require");
  await client.connect().catch((err) => {
    console.log(err);
  });
  let resp = await client.query(sql).catch((err) => {
    console.log(err);
  });
  await client.end();
  return resp?.rows || [];
}

const createTableQuery = `
	 CREATE TABLE IF NOT EXISTS routes (id TEXT unique, route TEXT,name TEXT);
     CREATE TABLE IF NOT EXISTS stops (stopID TEXT PRIMARY KEY, name TEXT,lat DOUBLE PRECISION,lon DOUBLE PRECISION);
     CREATE TABLE IF NOT EXISTS schedules (route TEXT,fromDay TEXT,toDay TEXT, stopID TEXT, arrival TEXT, forward INTEGER); 
     CREATE TABLE IF NOT EXISTS descriptions (route TEXT,description TEXT,forward INTEGER);
	 CREATE TABLE IF NOT EXISTS lines (route TEXT, forward INTEGER, polyline TEXT);
`;
await query(createTableQuery);