const mongoose = require("mongoose");
const { Schema } = mongoose;

const GameSchema = new Schema({
    homeTeam: { type: String, required: true, trim: true },
    awayTeam: { type: String, required: true, trim: true },
});

module.exports = mongoose.model("Game", GameSchema);
