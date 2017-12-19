const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const SERVER_PORT = 8888;

const { range } = require("lodash");

const fs = require("fs");

function getWatchedEpisodes() {
    const data = fs.readFileSync("watchedEpisodes.dat", {
        encoding: "utf-8"
    });

    const episodesRaw = data.split(",");

    if (episodesRaw[0] === '') {
        return [];
    }

    return episodesRaw.map(rawEpisode => parseInt(rawEpisode));
}

function getFillers() {
    const data = fs.readFileSync("fillers.dat", {
        encoding: "utf-8"
    });

    const fillersRaw = data.split(",").map(fillerRaw => fillerRaw.trim());

    const fillers = [];

    fillersRaw.forEach(fillerRaw => {
        if (fillerRaw.match(/^[0-9]+-[0-9]+$/)) {
            const rangeStart = parseInt(fillerRaw.split("-")[0]);
            const rangeEnd = parseInt(fillerRaw.split("-")[1]) + 1;

            fillers.push(...range(rangeStart, rangeEnd));
        } else {
            fillers.push(parseInt(fillerRaw));
        }
    });

    return fillers;
}

function getNextEpisode() {
    const episodes = getWatchedEpisodes().sort((a, b) => a - b);

    const lastEpisode = episodes[episodes.length - 1];

    const fillers = getFillers();

    let nextFound = false;
    let increment = 1;

    while (!nextFound) {
        if (fillers.includes(lastEpisode + increment)) {
            increment++;
        } else {
            nextFound = true;
        }
    }

    return lastEpisode + increment;
}

function setEpisodeWatched(episode) {
    const newString = [...getWatchedEpisodes(), episode].join(",");

    fs.writeFileSync('watchedEpisodes.dat', newString);
}

app.get("/nextEpisode", (req, res) => {
    res.json({
        success: true,
        episode: getNextEpisode()
    });
});

app.post("/setWatched", (req, res) => {
    const episode = parseInt(req.body.episode);

    if (!isNaN(episode)) {
        setEpisodeWatched(episode);

        res.json({
            success: true
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server started at port ${SERVER_PORT}`)
});