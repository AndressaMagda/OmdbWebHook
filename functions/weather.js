const http = require("http");

const WEATHER_KEY = "9f903bc7ad005f9d0986a10ec553312f";

var weatherPostRequest = function(req, res) {
  let city = req.body.queryResult.parameters["geo-city"];

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
};
exports.weatherRequest = weatherPostRequest;
