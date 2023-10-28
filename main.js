const User = require("./models/user");
const Game = require("./models/game");
const cron = require("node-cron");

const mongoose = require("mongoose");

let mongodbURI = process.argv[process.argv.length - 1];

const randomGameSelector = (games) => {
    const num = Math.floor(Math.random() * games.length);

    const num2 = Math.floor(Math.random() * 2);

    let game;
    if (num2 === 0) {
        game = games[num].homeTeam;
    } else {
        game = games[num].awayTeam;
    }

    return game;
};

const checkWinners = async () => {
    await mongoose.connect(mongodbURI);

    const winners = [];

    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    const day = date.getUTCDate();

    const prevGamesRes = await fetch(
        `https://statsapi.web.nhl.com/api/v1/schedule?date=2023-10-${day}`
    );
    const prevGames = await prevGamesRes.json();

    prevGames.dates[0].games.forEach((game) => {
        if (game.teams.away.score > game.teams.home.score) {
            winners.push(game.teams.away.team.name);
        } else {
            winners.push(game.teams.home.team.name);
        }
    });

    const users = await User.find({});
    const games = await Game.find({});

    for (const user in users) {
        if (users[user].currentSelection === "" && users[user].active) {
            let cont = true;

            while (cont) {
                const game = randomGameSelector(games);

                if (!users[user].teamsPicked.includes(game)) {
                    await User.findByIdAndUpdate(users[user]._id, {
                        currentSelection: game,
                    });

                    cont = false;
                }
            }
        }

        if (users[user].active) {
            const updatedUser = await User.findById(users[user]._id);

            if (!winners.includes(updatedUser.currentSelection)) {
                await User.findByIdAndUpdate(updatedUser._id, {
                    active: false,
                });
            }
            const teamsPicked = updatedUser.teamsPicked;
            teamsPicked.push(updatedUser.currentSelection);
            await User.findByIdAndUpdate(updatedUser._id, {
                currentSelection: "",
                teamsPicked: teamsPicked,
            });
        }
    }
    await mongoose.connection.close();
};

cron.schedule("0 13 * * 0", checkWinners);
