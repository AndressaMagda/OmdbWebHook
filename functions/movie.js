const http = require("http");

const OMDB_KEY = "f3dfd63c";

var moviePostRequest = function(req, res) {
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
};
exports.movieRequest = moviePostRequest;
