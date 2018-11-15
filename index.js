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
    "/movie",
    (req, res) => {
      if (req.body.title) {
        const reqUrl = encodeURI(`http://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${req.body.title}`);
        http.get(
          reqUrl,
          responseFromAPI => {
            let completeResponse = "";
            responseFromAPI.on("data", chunk => {
              completeResponse += chunk;
            });
            responseFromAPI.on("end", () => {
              const movie = JSON.parse(completeResponse);
  
              if(movie.Response==='True'){
                let dataToSend = `AH! ${movie.Title}, conheço este filme muito bem.`;
                dataToSend += ` Sabe, ele é um ${movie.Genre} e fazem parte do seu elenco principal os atores:  ${movie.Actors}.`;
                dataToSend +=` O mesmo foi lançado em ${movie.Year} e foi dirigido por ${movie.Director}.`;
                dataToSend+= ` Viu só, te disse que sabia tudo sobre este filme.`;

                return res.json({
                    speech: dataToSend,
                    displayText: dataToSend,
                    source: `Filme encontrado: ${movie}`
                  });
              }else{
                  return res.json({
                      speech: `Nunca tinha ouvi falar de um filme chamado ${req.body.title}. Vou assistir depois.`,
                      displayText: `Nunca tinha ouvi falar de um filme chamado ${req.body.title}. Vou assistir depois.`,
                      source: `Filme desconhecido: ${req.body.title}.`,
                    });
              }
  
            });
          },
          error => {
            return res.json({
              speech: `Nossa. Desculpe, mas algo deu errado. ${error}`,
              displayText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
              source: "movie-error-get"
            });
          }
        );
      } else {
        return res.json({
          speech: `Que vergonha. Não compreendi o que falou, poderia repetir?`,
          displayText: `Que vergonha. Não compreendi o que falou, poderia repetir?`,
          source: "movie-unknown-title"
        });
      }
    },
    error => {
      return res.json({
        speech: `Nossa. Desculpe, mas algo deu errado. ${error}`,
        displayText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
        source: "movie-error-post"
      });
    }
  );



app.post(
  "/weather",
  (req, res) => {
    if (req.body.city) {
      const reqUrl = encodeURI(
        `http://api.openweathermap.org/data/2.5/weather?q=${
          req.body.city
        },BR&units=metric&appid=${WEATHER_KEY}`
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

            if(weather.cod===200){
                let dataToSend = `Nossa. Amo ${
                  weather.name
                }, você sabia que anda fazendo ${
                  weather.main.temp
                } °C por lá agora? Acabei de checar na previsão do tempo`;
    
                return res.json({
                  speech: dataToSend,
                  displayText: dataToSend,
                  source: `Cidade encontrada: ${req.body.city}`
                });
            }else{
                return res.json({
                    speech: `Nunca tinha ouvido falar de uma cidade chamada ${req.body.city}. Vivendo e aprendendo.`,
                    displayText: `Nunca tinha ouvido falar de uma cidade chamada ${req.body.city}. Vivendo e aprendendo.`,
                    source: `Cidade desconhecida: ${req.body.city}.`,
                  });
            }

          });
        },
        error => {
          return res.json({
            speech: `Nossa. Desculpe, mas algo deu errado. ${error}`,
            displayText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
            source: "weather-error-get"
          });
        }
      );
    } else {
      return res.json({
        speech: `Perdão, mas não compreendi o que falou, poderia repetir?`,
        displayText: `Perdão, mas não compreendi o que falou, poderia repetir?`,
        source: "weather-unknown-city"
      });
    }
  },
  error => {
    return res.json({
      speech: `Nossa. Desculpe, mas algo deu errado. ${error}`,
      displayText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
      source: "weather-error-post"
    });
  }
);

app.all(
  "/",
  (req, res) => {
    return res.json({
      speech: `O servidor está funcionando...`,
      displayText: `O servidor está funcionando...`,
      source: "default-success"
    });
  },
  error => {
    return res.json({
      speech: `Nossa. Desculpe, mas algo deu errado. ${error}`,
      displayText: `Nossa. Desculpe, mas algo deu errado. ${error}`,
      source: "default-error"
    });
  }
);

app.listen(process.env.PORT || 8000, () => {
  console.log("O servidor está funcionando...");
});
