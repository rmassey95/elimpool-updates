const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, required: true },
    buyback: { type: Boolean, default: false, required: true },
    teamsPicked: { type: [String], required: true, default: [] },
    currentSelection: { type: String, default: "" },
    updatedSelection: { type: Date, default: new Date() },
});

module.exports = mongoose.model("User", UserSchema);
