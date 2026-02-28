require('dotenv').config();
const mongoose = require('mongoose');
const TrafficSignal = require('./models/TrafficSignal');
const WaterZone = require('./models/WaterZone');
const EmergencyIncident = require('./models/EmergencyIncident');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedInfrastructure = async () => {
  try {
    // Traffic Signals with Zone assignments
    const signals = [
      // North Zone
      { signalId: 'TS-NORTH-01', zone: 'North', status: 'RED', location: 'North-Main-Junction', modifiedBy: 'System' },
      { signalId: 'TS-NORTH-02', zone: 'North', status: 'GREEN', location: 'North-Cross-Road', modifiedBy: 'System' },
      { signalId: 'TS-NORTH-03', zone: 'North', status: 'YELLOW', location: 'North-Avenue', modifiedBy: 'System' },
      // South Zone
      { signalId: 'TS-SOUTH-01', zone: 'South', status: 'GREEN', location: 'South-Main-Road', modifiedBy: 'System' },
      { signalId: 'TS-SOUTH-02', zone: 'South', status: 'RED', location: 'South-Industrial-Area', modifiedBy: 'System' },
      { signalId: 'TS-SOUTH-03', zone: 'South', status: 'YELLOW', location: 'South-Expressway', modifiedBy: 'System' },
      // East Zone
      { signalId: 'TS-EAST-01', zone: 'East', status: 'GREEN', location: 'East-Coastal-Road', modifiedBy: 'System' },
      { signalId: 'TS-EAST-02', zone: 'East', status: 'YELLOW', location: 'East-Commercial-Hub', modifiedBy: 'System' },
      // West Zone
      { signalId: 'TS-WEST-01', zone: 'West', status: 'RED', location: 'West-Business-District', modifiedBy: 'System' },
      { signalId: 'TS-WEST-02', zone: 'West', status: 'GREEN', location: 'West-Residential-Area', modifiedBy: 'System' },
      // Central Zone
      { signalId: 'TS-CENTRAL-01', zone: 'Central', status: 'GREEN', location: 'Central-Downtown', modifiedBy: 'System' },
      { signalId: 'TS-CENTRAL-02', zone: 'Central', status: 'RED', location: 'Central-Plaza', modifiedBy: 'System' },
    ];

    for (const sig of signals) {
      const existing = await TrafficSignal.findOne({ signalId: sig.signalId });
      if (!existing) {
        const signal = new TrafficSignal(sig);
        await signal.save();
        console.log(`TrafficSignal ${sig.signalId} created`);
      } else {
        console.log(`TrafficSignal ${sig.signalId} already exists`);
      }
    }

    // Water Zones by City Zone
    const zones = [
      { zoneId: 'North', waterLevel: 75, flowRate: 50, isShutdown: false, modifiedBy: 'System' },
      { zoneId: 'South', waterLevel: 80, flowRate: 60, isShutdown: false, modifiedBy: 'System' },
      { zoneId: 'East', waterLevel: 70, flowRate: 40, isShutdown: false, modifiedBy: 'System' },
      { zoneId: 'West', waterLevel: 85, flowRate: 55, isShutdown: false, modifiedBy: 'System' },
      { zoneId: 'Central', waterLevel: 90, flowRate: 65, isShutdown: false, modifiedBy: 'System' },
    ];

    for (const zon of zones) {
      const existing = await WaterZone.findOne({ zoneId: zon.zoneId });
      if (!existing) {
        const zone = new WaterZone(zon);
        await zone.save();
        console.log(`WaterZone ${zon.zoneId} created`);
      } else {
        console.log(`WaterZone ${zon.zoneId} already exists`);
      }
    }

    // Emergency Incidents
    const incidents = [
      { incidentId: 'INC-001', type: 'Fire', location: 'North', status: 'OPEN' },
      { incidentId: 'INC-002', type: 'Accident', location: 'Central', status: 'OPEN' },
      { incidentId: 'INC-003', type: 'Medical', location: 'South', status: 'OPEN' },
    ];

    for (const inc of incidents) {
      const existing = await EmergencyIncident.findOne({ incidentId: inc.incidentId });
      if (!existing) {
        const incident = new EmergencyIncident(inc);
        await incident.save();
        console.log(`EmergencyIncident ${inc.incidentId} created`);
      } else {
        console.log(`EmergencyIncident ${inc.incidentId} already exists`);
      }
    }

    console.log('Infrastructure seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

connectDB().then(() => seedInfrastructure());
