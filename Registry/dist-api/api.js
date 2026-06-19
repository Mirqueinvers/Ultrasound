"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApiServer = startApiServer;
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const cors_1 = require("./api/middleware/cors");
const config_1 = require("./api/config");
const appointments_1 = __importDefault(require("./api/routes/appointments"));
const doctors_1 = __importDefault(require("./api/routes/doctors"));
async function startApiServer() {
    await (0, db_1.initDb)();
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(cors_1.corsMiddleware);
    app.use("/api/appointments", appointments_1.default);
    app.use("/api/doctors", doctors_1.default);
    app.listen(config_1.apiConfig.port, config_1.apiConfig.host, () => {
        console.log(`Registry API server running on http://${config_1.apiConfig.host}:${config_1.apiConfig.port}`);
    });
}
//# sourceMappingURL=api.js.map