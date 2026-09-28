const app = require("../src/server");
const connectDB = require("../src/config/db");

let databaseConnection;

module.exports = async (req, res) => {
    databaseConnection ??= connectDB().catch((error) => {
        databaseConnection = undefined;
        throw error;
    });

    await databaseConnection;
    return app(req, res);
};