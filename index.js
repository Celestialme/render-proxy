import express from 'express';
import { headers } from './utils.js';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
	var url = 'https://transit.ttc.com.ge/pis-gateway/api/v2/routes?modes=BUS';
	const response = await fetch(url, { headers });
	if (response.status !== 200) {
		res.send(JSON.stringify({ error: response.statusText }));
		return;
	}
	const data = await response.json();

	res.send(JSON.stringify(data));
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
