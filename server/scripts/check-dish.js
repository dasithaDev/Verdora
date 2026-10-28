import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthy_cafe_dev';
const targetName = process.argv[2] || 'Ceylon Organic Chia Pudding';

async function main() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`\n======================================================`);
    console.log(`🔍 MongoDB Inspector: db.menuitems.findOne({ name: "${targetName}" })`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`======================================================`);

    const doc = await mongoose.connection.db.collection('menuitems').findOne({ name: targetName });

    if (!doc) {
      console.log(`Result in MongoDB: null  (Document does not exist in collection)`);
    } else {
      console.log(`Result in MongoDB:\n`);
      console.log(JSON.stringify(doc, null, 2));
      console.log(`\n📌 Status Summary:`);
      console.log(`   - ID:          ${doc._id}`);
      console.log(`   - Price:       Rs. ${doc.price}`);
      console.log(`   - Available:   ${doc.isAvailable} (${doc.isAvailable ? 'Visible to customers' : 'Soft-deleted / Hidden'})`);
      console.log(`   - Created At:  ${doc.createdAt}`);
      console.log(`   - Updated At:  ${doc.updatedAt}`);
    }
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('MongoDB Query Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
