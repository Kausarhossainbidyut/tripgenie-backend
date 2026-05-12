import mongoose from 'mongoose';
import config from './config/db'; // use db.ts
import app from './app';


async function main() {
  try {
    if (!config.database_url) {
      throw new Error('Database URL is not provided in environment variables');
    }

    await mongoose.connect(config.database_url);

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

main();
