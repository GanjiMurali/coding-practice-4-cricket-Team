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

//1) GET players API
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(playersQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  let newArray = [];
  for (let player of playersArray) {
    let players = convertDbObjectToResponseObject(player);
    newArray.push(players);
    //console.log(players);
  }
  response.send(newArray);
  //console.log(playersArray);
});

//2) POST player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}')`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//3) GET player Details With ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const player = await db.get(playersIdQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  let playerDetailsWithId = convertDbObjectToResponseObject(player);

  response.send(playerDetailsWithId);
});

//4) PUT update Player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}', jersey_name = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

module.exports = app;
