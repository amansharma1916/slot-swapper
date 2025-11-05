const mongoose = require('mongoose');
const {
    MongoMemoryServer
} = require('mongodb-memory-server');
let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Test database connected');
});
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✅ Test database disconnected');
});