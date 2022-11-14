const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndserver();

//GET players API
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(playersQuery);
  response.send(playersArray);
});

//POST player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}')`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET player Details With ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const player = await db.get(playersIdQuery);
  response.send(player);
});

module.exports = app;
