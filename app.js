const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMovie = `
    select
    movie_name
    from
    movie;`;
  const moviesArray = await db.all(getAllMovie);
  console.log(moviesArray);
  response.send(
    moviesArray.map((moviename) => convertMovieNameToPascalCase(moviename))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    insert into
    movie (director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}');`;

  const dbResponse = await db.run(addMovie);
  response.send("Movie Successfully Added");
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    select *
    from movie
    where movie_id=${movieId};`;
  const movie = await db.get(getMovie);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
    update
    movie
    set 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    where movie_id=${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    select *
    from movie
    where movie_id=${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

const convertDirectorToPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getAllDirector = `
    select * from
    director;`;
  const moviesArray = await db.all(getAllDirector);
  response.send(
    moviesArray.map((director) => convertDirectorToPascalCase(director))
  );
});

const convertMovieNameToPascal = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovie = `
    select
    movie_name
    from director inner join movie 
    on director.director_id=movie.director_id
    where
    director.director_id=${directorId};`;
  const movies = await db.all(getDirectorMovie);
  response.send(
    movies.map((movienames) => convertMovieNameToPascal(movienames))
  );
});
module.exports = app;
