const PORT = parseInt(process.env.API_PORT || "3456", 10);

export const apiConfig = {
  port: PORT,
  host: process.env.API_HOST || "0.0.0.0",
};