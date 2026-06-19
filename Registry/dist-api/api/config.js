"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConfig = void 0;
const PORT = parseInt(process.env.API_PORT || "3456", 10);
exports.apiConfig = {
    port: PORT,
    host: process.env.API_HOST || "0.0.0.0",
};
//# sourceMappingURL=config.js.map