# Zero Trust Smart City Dashboard - Implementation Guide

## Architecture Overview

The Smart City Dashboard implements a complete zero-trust infrastructure management system with 5 interconnected zones (North, South, East, West, Central), each with distinct infrastructure layers:

### Core Components

#### 1. **SecurityBanner** (`SecurityBanner.js`)
- Global threat level indicator (top fixed banner when score > 80)
- Device trust status tracking
- Rate limit alerts (429 responses)
- Real-time threat and trust score display

#### 2. **ZoneMapNew** (`ZoneMapNew.js`)
- Leaflet-based interactive map with 5 geographically defined zones
- Real-time zone data polling (5-second intervals)
- Zone overlay color-coding based on risk:
  - Green (< 30): Secure
  - Yellow (30-70): Caution
  - Red (70+): Critical
- Displays zone metrics:
  - Traffic health (based on signal status)
  - Water level (%)
  - Grid load (%)
  - Light status (brightness %)
  - Calculated risk score

#### 3. **TrafficControl** (`TrafficControl.js`)
Security-integrated traffic signal management:
- 5-10 signal markers per zone
- Status display: RED / YELLOW / GREEN
- Role-based access control:
  - Admin/TrafficOperator only
  - Denied if device trust < 40%
  - Denied if global threat > 80% (non-admin)
- Access denial events increase zone risk visually
- Emergency override available (Admin/EmergencyAuthority)

#### 4. **WaterControl** (`WaterControl.js`)
Water system management with simulation:
- Per-zone reservoir level (%)
- Flow rate adjustment (L/s)
- Contamination flag triggering
- Water level simulation (decreases over time)
- Security-based restrictions:
  - Flow adjustment: Admin only
  - Zone shutdown: Admin only
- Contamination detection feeds threat events

#### 5. **GridControl** (`GridControl.css`)
Electricity grid monitoring:
- 5 substations (one per zone)
- Real-time load percentage with visual gauge
- Warning flash when load > 85%
- Rebalance action (always available)
- Isolate action:
  - Admin only
  - Disabled when global threat > 80%
- Visual threat mode indicator

#### 6. **StreetLightControl** (`StreetLightControl.js`)
Street lighting with energy transparency:
- Per-zone brightness control (20-100%)
- Auto mode toggle (energy save)
- Real-time energy usage (W)
- Annual projection
- Glowing overlay intensity based on brightness
- Simulated brightness fluctuation

#### 7. **EmergencyResponse** (`EmergencyResponse.js`)
Real-time incident management:
- Active incident list with pulsing animation
- Random incident simulation
- Incident types: Fire, Accident, Medical
- Status tracking: OPEN → DISPATCHED → CLOSED
- Controls (accessible to EmergencyAuthority):
  - Dispatch unit
  - Escalate severity
- Increases zone risk on high severity
- Statistics dashboard

#### 8. **ThreatFeed** (`ThreatFeed.js`)
Unified security event logging:
- Combines threat events and access denial events
- Filter options: All / Threats / Denials
- Real-time polling (5-second intervals)
- Severity-based color coding
- Access denial details: user, role, IP, endpoint
- Event summary statistics

### API Integration

**Base URL:** `http://localhost:5000`

#### Infrastructure Endpoints (All require JWT)

- `GET /traffic/signals` - Get all traffic signals
- `POST /traffic/signal/:id/change` - Change signal status
- `POST /traffic/emergency-override` - Emergency override
- `GET /water/levels` - Get water zone levels
- `POST /water/flow-adjust` - Adjust flow rate
- `POST /water/shutdown-zone` - Emergency shutdown
- `POST /power/grid/override` - Grid control
- `GET /emergency/incidents` - Get incidents
- `POST /emergency/dispatch-unit` - Dispatch response
- `GET /threat/status` - Get global threat score
- `GET /monitoring/threats` - Get threat events
- `GET /monitoring/audit` - Get audit logs
- `GET /monitoring/user-device-trust` - Get device trust score

### Security Features

#### 1. **Role-Based Access Control (RBAC)**
- Admin: Full access to all systems
- TrafficOperator: Traffic signal control only
- EmergencyAuthority: Emergency response + water management
- SecurityAnalyst: Monitoring and audit logs only

#### 2. **Device Trust Scoring**
- Tracks device trustworthiness (0-100)
- Threshold: < 40% restricts sensitive actions
- Shown in banner and status bar
- Updated on login success/failed attempts

#### 3. **Global Threat Score**
- Persistent system-wide threat indicator (0-100)
- Triggers elevated mode when > 80:
  - Restricts non-admin access
  - Disables grid isolation actions
  - Shows critical banner
  - Increases zone risk visualizations
- Calculated from threat events and breaches

#### 4. **Rate Limiting (DDoS Detection)**
- 10 requests per 15 seconds per IP
- Returns 429 on breach
- Triggers visual alert in banner
- Logs to threat feed

#### 5. **Access Denial Interactions**
- Unauthorized actions visually increase zone risk
- All denials logged to audit trail
- Appear in threat feed with role/IP details

### Data Flow & Polling

All modules poll their respective endpoints every 5 seconds:
- Memoized to prevent unnecessary re-renders
- Intervals cleaned up on component unmount
- Promise.all() batches parallel requests
- Error handling via console.error (non-blocking)

### Authentication Flow

1. User logs in with credentials
2. Backend returns JWT token + user role + device trust score
3. Token stored in AuthContext and used for all API calls
4. SecurityBanner monitors and updates:
   - Global threat score (via /threat/status)
   - Device trust changes (via /monitoring/user-device-trust)
5. Rate limit alerts trigger on 429 responses

### Styling Architecture

All components use minimal dark-theme CSS:
- Primary background: #0a0a0a
- Panel background: #1a1a1a
- Text: #fff / #aaa / #888
- Accent: #66ccff (primary), #0066ff (buttons)
- Risk colors: Green (#00cc44), Yellow (#ffaa00), Red (#ff3333)
- No external CSS framework (pure CSS modules)

### Performance Optimizations

- useCallback() for event handlers and polling functions
- useMemo() for heavy calculations
- Interval cleanup on unmount
- Lazy polling (5-second intervals, not real-time)
- Memoized theme/color calculations
- Grid-based layouts for efficient rendering

### Deployment Checklist

- [ ] Run `npm install` in /client
- [ ] Run `npm start` in /client (React dev server on :3000)
- [ ] Run `npm start` in /server (Node server on :5000)
- [ ] Run `node seedInfrastructure.js` in /server (populate zones)
- [ ] Frontend connects to backend via CORS (config in app.js)
- [ ] Test login with "admin" / "password123"
- [ ] Verify all endpoints return data
- [ ] Check browser console for polling errors

### Advanced Features

**Zone Risk Calculation:**
```
risk = 0
if (traffic_health < 50) risk += 20
if (water_level < 30) risk += 25
if (grid_load > 80) risk += 30
if (light_status < 50) risk += 15
risk += max(0, (threat_score - 30) * 0.3)
Final: risk_score = min(100, risk)
```

**Security Checks (applies globally):**
```
User authorized? Check role
Device trusted? Check trust_score >= 40
System safe? Check threat_score <= 80 (or role === Admin)
All three must pass for sensitive actions
```

**Data Simulation:**
- Water levels decrease by 0.5% per poll cycle
- Grid loads oscillate ±10% per cycle
- Street light brightness ±3% per cycle
- Traffic signals change periodically (not realistic)
- Contamination detected probabilistically (5% per cycle)
- Emergency incidents spawn randomly (15% every 8s)

### Future Extensions

1. WebSocket integration for real-time updates
2. Machine learning-based threat detection
3. Automated incident response (action triggers)
4. Multi-city federation
5. Mobile app variant
6. Advanced analytics dashboard
7. Predictive maintenance recommendations
