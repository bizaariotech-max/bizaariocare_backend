const mongoose = require("mongoose");
const _envsettings = new mongoose.Schema({
    EnvSettingCode: { type: String },
    EnvSettingDesc: { type: String },
    EnvSettingValue: { type: String },
    EnvSettingTextValue: { type: String },
    EnvCategory: { type: String },
});
module.exports = mongoose.model("admin_env_setting", _envsettings);
