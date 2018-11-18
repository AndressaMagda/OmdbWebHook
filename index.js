"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

var movie = require("./functions/movie");
var weather = require("./functions/weather");

app.use(bodyParser.json());

app.post(
  "/api",
  (req, res) => {
    let action = req.body.queryResult.action;
    switch (action) {
      case "movie":
        movie.movieRequest(req, res);
        break;
      case "weather":
        weather.weatherRequest(req, res);
        break;
      default:
        defaultRequest(req, res);
    }
  },
  error => {
    return res.json({
      fulfillmentText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
      fulfillmentMessages: [
        { text: { text: [`Nossa. Desculpe, mas algo deu errado. ${error}`] } }
      ],
      source: "movie-error-post"
    });
  }
);

function defaultRequest(req, res) {
  res.json({
    fulfillmentText: `O servidor está funcionando...`,
    fulfillmentMessages: [
      { text: { text: [`O servidor está funcionando...`] } }
    ],
    source: "default-request"
  });
}

app.listen(process.env.PORT || 8000, () => {
  console.log("O servidor está funcionando...");
});
