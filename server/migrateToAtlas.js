require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI = process.env.LOCAL_MONGO_URI;
const ATLAS_URI = process.env.MONGO_URI;

async function migrate() {
    console.log('Starting migration...');

    // Connect to local
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('Connected to Local DB');

    // Connect to Atlas
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('Connected to Atlas DB');

    const collections = await localConn.db.listCollections().toArray();
    const excludeCollections = ['refreshtokens', 'revokedtokens', 'auditlogs', 'infrastructurestates'];

    for (const collInfo of collections) {
        const collName = collInfo.name;
        if (excludeCollections.includes(collName)) {
            console.log(`Skipping ${collName}`);
            continue;
        }

        console.log(`Migrating ${collName}...`);
        const localColl = localConn.db.collection(collName);
        const atlasColl = atlasConn.db.collection(collName);

        // Clear existing data in Atlas for this collection to avoid duplicates if re-run
        await atlasColl.deleteMany({});

        const data = await localColl.find({}).toArray();
        if (data.length > 0) {
            // For threatevents, if there's too many, we might want to slice, but 4k is fine.
            // However, to stay safe with the 512MB limit, we'll take all for now as they are likely small.
            await atlasColl.insertMany(data);
            console.log(`Migrated ${data.length} documents from ${collName}`);
        } else {
            console.log(`${collName} is empty, skipping insert.`);
        }
    }

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
