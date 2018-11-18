"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const OMDB_KEY = "f3dfd63c";
const WEATHER_KEY = "9f903bc7ad005f9d0986a10ec553312f";

app.use(bodyParser.json());

app.post(
  "/api",
  (req, res) => {
      let action = req.body.queryResult.action;
      switch (action) {
        case "movie":
          movieRequest(req, res);
          break;
        case "weather":
          weatherRequest(req, res);
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

function movieRequest(req, res) {
  let movieTitle = req.body.queryResult.parameters["movie"];

  if (movieTitle) {
    const reqUrl = encodeURI(
      `http://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${movieTitle}`
    );
    http.get(
      reqUrl,
      responseFromAPI => {
        let completeResponse = "";
        responseFromAPI.on("data", chunk => {
          completeResponse += chunk;
        });
        responseFromAPI.on("end", () => {
          const movie = JSON.parse(completeResponse);

          if (movie.Response === "True") {
            let dataToSend = `AH! ${
              movie.Title
            }, conheço este filme muito bem.`;
            dataToSend += ` Sabe, ele é um ${
              movie.Genre
            } e fazem parte do seu elenco principal os atores:  ${
              movie.Actors
            }.`;
            dataToSend += ` O mesmo foi lançado em ${
              movie.Year
            } e foi dirigido por ${movie.Director}.`;
            dataToSend += ` Viu só, te disse que sabia tudo sobre este filme.`;

            return res.json({
              fulfillmentText: `${dataToSend}`,
              fulfillmentMessages: [{ text: { text: [`${dataToSend}`] } }],
              action: `movie`,
              source: `Filme encontrado: ${movie.Title}`
            });
          } else {
            return res.json({
              fulfillmentText: `Nunca tinha ouvi falar de um filme chamado ${
                req.body.title
              }. Vou assistir depois.`,
              fulfillmentMessages: [
                {
                  text: {
                    text: [
                      `Nunca tinha ouvi falar de um filme chamado ${
                        req.body.title
                      }. Vou assistir depois.`
                    ]
                  }
                }
              ],
              source: `Filme Desconhecido: ${movie.Title}`
            });
          }
        });
      },
      error => {
        return res.json({
          fulfillmentText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
          fulfillmentMessages: [
            {
              text: { text: [`Nossa. Desculpe, mas algo deu errado. ${error}`] }
            }
          ],
          source: "movie-error-get"
        });
      }
    );
  } else {
    return res.json({
      fulfillmentText: `Que vergonha. Não compreendi o que falou, poderia repetir?`,
      fulfillmentMessages: [
        {
          text: {
            text: [`Que vergonha. Não compreendi o que falou, poderia repetir?`]
          }
        }
      ],
      source: "movie-unknown-title"
    });
  }
}

function weatherRequest(req, res) {
  let city = req.body.queryResult.parameters["city"];

  if (city) {
    const reqUrl = encodeURI(
      `http://api.openweathermap.org/data/2.5/weather?q=${city},BR&units=metric&appid=${WEATHER_KEY}`
    );

    //Para °C você adiciona: units = metric e se você usar ºF você usa units = imperial.
    http.get(
      reqUrl,
      responseFromAPI => {
        let completeResponse = "";
        responseFromAPI.on("data", chunk => {
          completeResponse += chunk;
        });
        responseFromAPI.on("end", () => {
          const weather = JSON.parse(completeResponse);

          if (weather.cod === 200) {
            let dataToSend = `Nossa. Amo ${
              weather.name
            }, você sabia que anda fazendo ${
              weather.main.temp
            } °C por lá agora? Acabei de checar na previsão do tempo`;
            return res.json({
              fulfillmentText: dataToSend,
              fulfillmentMessages: [{ text: { text: [`${dataToSend}`] } }],
              source: `Cidade encontrada: ${weather.name}`
            });
          } else {
            return res.json({
              fulfillmentText: `Nunca tinha ouvido falar de uma cidade chamada ${city}. Vivendo e aprendendo.`,
              fulfillmentMessages: [
                {
                  text: {
                    text: `Nunca tinha ouvido falar de uma cidade chamada ${city}. Vivendo e aprendendo.`
                  }
                }
              ],
              source: `Cidade desconhecida: ${city}.`
            });
          }
        });
      },
      error => {
        return res.json({
          fulfillmentText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
          fulfillmentMessages: [
            {
              text: { text: [`Nossa. Desculpe, mas algo deu errado. ${error}`] }
            }
          ],
          source: "weather-error-get"
        });
      }
    );
  } else {
    return res.json({
      fulfillmentText: `Perdão, mas não compreendi o que falou, poderia repetir?`,
      fulfillmentMessages: [
        {
          text: {
            text: [`Perdão, mas não compreendi o que falou, poderia repetir?`]
          }
        }
      ],
      source: "weather-unknown-city"
    });
  }
}

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
