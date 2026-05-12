import mongoose from 'mongoose';
import dns from "node:dns";
import app from './app';
import config from './config/db'; // use db.ts


dns.setServers(["1.1.1.1", "8.8.8.8"]);
async function main() {
  try {
    if (!config.database_url) {
      throw new Error('Database URL is not provided in environment variables');
    }

    await mongoose.connect(config.database_url);

    app.listen(config.port, () => {
      // Server started successfully
    });
  } catch (err) {
    process.exit(1);
  }
}

main();
