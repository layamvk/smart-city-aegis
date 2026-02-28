# Zero Trust Smart City Dashboard - Quick Start Guide

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (running locally or Atlas URI configured)
- Git

## Installation

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartcity
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 2. Frontend Setup

```bash
cd client
npm install
```

## Running the Application

### Terminal 1: Start MongoDB

```bash
mongod  # or ensure MongoDB service is running
```

### Terminal 2: Start Backend

```bash
cd server
npm start
```

You should see: `Server running on port 5000`

### Terminal 3: Seed Infrastructure Data

```bash
cd server
node seedInfrastructure.js
```

Output should show: `Infrastructure seeding complete`

### Terminal 4: Start Frontend

```bash
cd client
npm start
```

React dev server opens on http://localhost:3000

## Login Credentials

The system is pre-seeded with these test accounts:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | password123 | Admin | Full system access |
| operator | password123 | TrafficOperator | Traffic control only |
| authority | password123 | EmergencyAuthority | Emergency response, water control |
| analyst | password123 | SecurityAnalyst | Monitoring and audit logs |

## First-Time Usage

1. Open http://localhost:3000
2. Login as `admin` / `password123`
3. Navigate through tabs:
   - **Overview**: Zone map + emergency panel + threat feed
   - **Traffic Control**: Signal management interface
   - **Water Management**: Reservoir and flow rate controls
   - **Power Grid**: Substation load monitoring
   - **Street Lights**: Brightness and energy controls
   - **Emergency**: Incident response system
   - **Security Feeds**: Unified threat and access logs

## Key Features to Explore

### Security Indicators

- **Top Banner**: Changes red when global threat score > 80
- **Status Bar**: Shows real-time threat score and device trust
- **Access Denied Messages**: Appear when attempting unauthorized actions
- **Threat Feed**: Shows all security events with severity

### Zone Interactions

- Click any zone on the map to see detailed metrics
- Colors change based on risk score:
  - Green (0-30): Normal operations
  - Yellow (30-70): Elevated monitoring
  - Red (70-100): Critical alert

### Access Control

Try logging in as different roles and observe:
- **TrafficOperator**: Cannot access emergency or water systems
- **Admin**: Full access to all systems
- **EmergencyAuthority**: Emergency + water systems only
- **SecurityAnalyst**: View-only access to threat data

### Device Trust Testing

Device trust degrades with failed access attempts. When trust < 40%:
- Control buttons become disabled
- Tooltip indicates "Low device trust"
- User must wait for trust score to recover

### Threat Mode Testing

To observe threat mode behavior:
- Device trust is simulated but global threat score is real-time
- When global threat score > 80:
  - Banner turns red with "SYSTEM ELEVATED" message
  - Non-admin users cannot control grid isolation
  - Traffic control restricted for operators
  - Zone risk visualization increases

## API Health Check

Verify all endpoints are working:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/traffic/signals

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/threat/status

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/monitoring/audit
```

## Troubleshooting

### "Cannot connect to backend"
- Ensure server is running on port 5000
- Check MongoDB connection
- Verify CORS is enabled in app.js

### "Token expiration"
- Clear browser localStorage
- Re-login with valid credentials
- Check JWT_SECRET in .env matches

### "No zones appearing"
- Run `node seedInfrastructure.js` again
- Check MongoDB for collections: `db.trafficSignals.find()`

### Missing CSS styles
- Verify all CSS files exist in `client/src/styles/`
- Clear browser cache (Ctrl+Shift+Delete)
- Restart React dev server

## Development Tips

### Useful Browser Devtools

1. **React DevTools**: Install React Developer Tools extension
2. **Network Tab**: Monitor API calls and responses
3. **Console**: Watch for polling errors
4. **Application > LocalStorage**: Inspect stored JWT

### Monitoring Polling

All components poll every 5 seconds. Watch Network tab to see:
- `/traffic/signals` requests
- `/water/levels` requests
- `/threat/status` requests
- etc.

### Simulated Events

- Water contamination: ~5% chance per cycle
- Emergency incidents: ~15% chance every 8 seconds
- Traffic signal changes: Periodic updates
- Load fluctuations: ±10% per cycle

## Production Deployment

Before deploying to production:

1. **Security**:
   - Change default credentials in seed files
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Configure proper CORS origins
   - Implement rate limiting (already active on backend)

2. **Environment**:
   - Set NODE_ENV=production
   - Use external MongoDB Atlas
   - Add proper error logging
   - Configure backups

3. **Performance**:
   - Build React app: `npm run build`
   - Serve static files from backend
   - Enable gzip compression
   - Cache API responses where appropriate

4. **Monitoring**:
   - Set up application monitoring
   - Alert on threat score > 50
   - Track API response times
   - Monitor device trust changes

## Support & Documentation

- Implementation details: See `IMPLEMENTATION.md`
- API specification: Check route files in `server/routes/`
- Component architecture: See component JSDoc comments
- Style guide: Review CSS files for design tokens

## Next Steps

After familiarizing yourself with the dashboard:

1. Try different user roles and observe access restrictions
2. Test rate limiting by making rapid API calls
3. Observe threat score changes from access denials
4. Create custom incidents in the emergency system
5. Monitor zone risk scores as infrastructure changes
