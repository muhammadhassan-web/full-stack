import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/smallweb');
  const db = mongoose.connection.db!;
  for (const c of ['people', 'sites', 'visits']) {
    console.log(c, await db.collection(c).countDocuments());
  }
  await mongoose.disconnect();
}
main();