import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import querystring from 'querystring';

dotenv.config();

const port = process.env.PORT || 5000;
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

const app = express();
app.use(cors());

const sendTmdbRequest = (path, queryParams, res) => {
  const queryString = querystring.stringify(queryParams);
  const options = {
    hostname: "api.themoviedb.org",
    path: `${path}?${queryString}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${TMDB_BEARER_TOKEN}`,
      "Content-Type": "application/json"
    }
  };

  const tmdbRequest = https.request(options, tmdbResponse => {
    let data = "";

    tmdbResponse.on("data", chunk => {
      data += chunk;
    });

    tmdbResponse.on("end", () => {
      if (tmdbResponse.statusCode === 200) {
        res.json(JSON.parse(data));
      } else {
        console.error("Error response from TMDB: ", tmdbResponse.statusCode, data);
        res.status(tmdbResponse.statusCode).json({ error: "Error fetching data from TMDB" });
      }
    });
  });

  tmdbRequest.on("error", error => {
    console.error("Request error: ", error);
    res.status(500).json({ error: "Error fetching data from TMDB" });
  });

  tmdbRequest.end();
};

app.get("/discover/movie", (req, res) => {
  const path = "/3/discover/movie";
  const queryParams = req.query;
  sendTmdbRequest(path, queryParams, res);
});

app.get("/genre/movie/list", (req, res) => {
  const path = "/3/genre/movie/list";
  sendTmdbRequest(path, {}, res);
});

app.get("/movie/:id/videos", (req, res) => {
  const { id } = req.params;
  const path = `/3/movie/${id}/videos`;
  sendTmdbRequest(path, {}, res);
});

app.get("/movie/:id", (req, res) => {
  const { id } = req.params;
  const path = `/3/movie/${id}`;
  sendTmdbRequest(path, {}, res);
});

app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});