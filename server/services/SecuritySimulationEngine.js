const crypto = require('crypto');
const https = require('https');
const SecurityLog = require('../models/SecurityLog');
const SystemState = require('../models/SystemState');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function jitter() {
    return Math.floor(Math.random() * 900) + 700; // 700-1600ms per step
}

function randomPort() {
    return Math.floor(Math.random() * 20000) + 40000;
}

function randomRequestId() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
}

function randomUserAgent() {
    const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.6167.85 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X) Firefox/119.0",
        "curl/7.68.0 (Ubuntu)",
        "PostmanRuntime/7.36.0",
        "python-requests/2.28.2",
        "Go-http-client/1.1"
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}

function randomSessionId() {
    return crypto.randomBytes(12).toString('hex');
}

// ─── Real IP Cache (fetched once per server lifetime) ────────────────────────
let _cachedRealIpInfo = null;

function fetchRealIpData() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'ipinfo.io',
            path: '/json',
            method: 'GET',
            timeout: 5000,
            headers: { 'User-Agent': 'SmartCityAegis/1.0' }
        };
        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.ip && !parsed.ip.startsWith('10.') && !parsed.ip.startsWith('192.168.')) {
                        resolve({ ip: parsed.ip, city: parsed.city || 'Unknown', region: parsed.region || '', country: parsed.country || 'Unknown', org: parsed.org || 'Unknown ISP' });
                    } else resolve(null);
                } catch { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

async function getRealIpInfo() {
    if (_cachedRealIpInfo) return _cachedRealIpInfo;
    const info = await fetchRealIpData();
    if (info) _cachedRealIpInfo = info;
    return info;
}

// ─── Varied Mock Attacker Profiles (different per attack) ─────────────────────
const MOCK_ATTACKERS = [
    { ip: '185.220.101.47', city: 'Nuremberg', region: 'Bavaria', country: 'DE', isp: 'AS-CHOOPA LLC (Tor Exit)' },
    { ip: '194.165.16.4', city: 'Amsterdam', region: 'Noord-Holland', country: 'NL', isp: 'The Tor Project Inc.' },
    { ip: '45.155.205.233', city: 'Moscow', region: 'Moscow Oblast', country: 'RU', isp: 'BlazingFast LLC' },
    { ip: '203.0.113.52', city: 'Beijing', region: 'Hebei', country: 'CN', isp: 'ChinaNet Backbone' },
    { ip: '80.66.88.208', city: 'Frankfurt', region: 'Hesse', country: 'DE', isp: 'M247 Europe SRL' },
    { ip: '162.247.74.74', city: 'New York', region: 'New York', country: 'US', isp: 'Quintex Alliance Consulting' },
    { ip: '91.108.4.234', city: 'Ashburn', region: 'Virginia', country: 'US', isp: 'Telegram DC Cloud' },
    { ip: '104.21.44.12', city: 'Singapore', region: 'Central', country: 'SG', isp: 'Cloudflare Inc.' },
    { ip: '5.188.206.16', city: 'Kharkov', region: 'Kharkivska', country: 'UA', isp: 'FOP Dmytro Nedilko' },
    { ip: '198.54.117.210', city: 'Reykjavik', region: 'Capital', country: 'IS', isp: 'Namecheap Inc.' },
];

function pickMockAttacker() {
    return MOCK_ATTACKERS[Math.floor(Math.random() * MOCK_ATTACKERS.length)];
}

// ─── Resolve Session Meta ─────────────────────────────────────────────────────
async function resolveAttackerMeta(realIp, callerGeo, callerIsp) {
    // If browser already resolved the geo, use it directly — no API call needed
    if (callerGeo && callerIsp) {
        return {
            ipAddress: realIp || 'Unknown',
            geoLocation: callerGeo,
            isp: callerIsp,
            deviceFingerprint: crypto.randomBytes(16).toString('hex'),
            userAgent: randomUserAgent(),
            sessionId: randomSessionId(),
            srcPort: randomPort(),
            requestId: randomRequestId(),
        };
    }

    // Fallback: server-side lookup via cached ipinfo.io call
    const isLocal = !realIp || realIp === '::1' || realIp === '127.0.0.1' || realIp.startsWith('::ffff:127');
    const realInfo = await getRealIpInfo();

    let sessionIp = realIp || 'Unknown';
    let sessionGeo = 'Unresolved';
    let sessionIsp = 'Unknown ISP';

    if (realInfo) {
        if (isLocal) sessionIp = realInfo.ip;
        sessionGeo = `${realInfo.city}${realInfo.region ? ', ' + realInfo.region : ''}, ${realInfo.country}`;
        sessionIsp = realInfo.org;
    }

    return {
        ipAddress: sessionIp,
        geoLocation: sessionGeo,
        isp: sessionIsp,
        deviceFingerprint: crypto.randomBytes(16).toString('hex'),
        userAgent: randomUserAgent(),
        sessionId: randomSessionId(),
        srcPort: randomPort(),
        requestId: randomRequestId(),
    };
}

// ─── Snapshot & Restore ───────────────────────────────────────────────────────

async function snapshotState(user, systemState) {
    return {
        trustScore: user.deviceTrustScore,
        infraThreatScore: systemState ? systemState.value : 0,
        accountLocked: user.accountLocked,
        failedLoginAttempts: user.failedLoginAttempts
    };
}

async function restoreState(user, systemState, snapshot) {
    user.deviceTrustScore = snapshot.trustScore;
    user.accountLocked = snapshot.accountLocked;
    user.failedLoginAttempts = snapshot.failedLoginAttempts;
    await user.save();
    if (systemState) {
        systemState.value = snapshot.infraThreatScore;
        await systemState.save();
    }
}

// ─── Main Simulation ──────────────────────────────────────────────────────────

async function simulateAttack({ type, user, io, realIp, callerGeo, callerIsp }) {
    let systemState = await SystemState.findOne({ name: 'infraThreatScore' });
    if (!systemState) {
        systemState = new SystemState({ name: 'infraThreatScore', value: 20 });
        await systemState.save();
    }

    const snapshot = await snapshotState(user, systemState);
    const meta = await resolveAttackerMeta(realIp, callerGeo, callerIsp);
    const trustBefore = user.deviceTrustScore;
    const threatBefore = systemState.value;

    function emit(message, severity = 'INFO') {
        if (io) io.emit('security-log', { timestamp: new Date(), message, severity, internal: true });
    }

    let trustDelta = 0;
    let threatDelta = 0;
    let effectOnSafety = '';
    let securityRating = '';

    // ── Emit IP/Session Header for every attack ──
    await delay(jitter());
    emit(`▶ DRILL INITIATED — Attack Type: ${type}`, 'INFO');
    await delay(jitter());
    emit(`   Source IP    : ${meta.ipAddress}`, 'INFO');
    await delay(jitter());
    emit(`   Geo-Location : ${meta.geoLocation}`, 'INFO');
    await delay(jitter());
    emit(`   ISP/Network  : ${meta.isp}`, 'INFO');
    await delay(jitter());
    emit(`   User-Agent   : ${meta.userAgent}`, 'INFO');
    await delay(jitter());
    emit(`   Session-ID   : ${meta.sessionId}`, 'INFO');
    await delay(jitter());
    emit(`   Src Port     : ${meta.srcPort}   Request-ID: ${meta.requestId}`, 'INFO');
    await delay(jitter());
    emit(`   Device FP    : ${meta.deviceFingerprint}`, 'INFO');
    await delay(jitter());
    emit(`─────────────────────────────────────────────`, 'INFO');

    // ─────────────────────────────────────────────────────────────────────
    if (type === 'CREDENTIAL_STUFFING') {
        trustDelta = -20; threatDelta = 5;
        effectOnSafety = 'Repeated authentication failures detected at the edge gateway. Account temporarily locked via Atomic DB-lock mechanism. Brute force neutralized.';
        securityRating = 'A+ (Atomic DB Lock)';

        emit(`[AUTH] Inbound authentication request intercepted from ${meta.ipAddress}:${meta.srcPort}`, 'INFO');
        await delay(jitter());
        emit(`[AUTH] Origin: ${meta.geoLocation} via ${meta.isp}`, 'INFO');
        await delay(jitter());
        emit(`[AUTH] Attempt 1/3 → FAILED — password mismatch (bcrypt digest: invalid)`, 'WARNING');
        await delay(jitter());
        emit(`[AUTH] Attempt 2/3 → FAILED — credential not found in secure hash chain`, 'WARNING');
        await delay(jitter());
        emit(`[AUTH] Attempt 3/3 → FAILED — suspected credential stuffing list payload`, 'CRITICAL');
        await delay(jitter());
        emit(`[LOCK] Consecutive failure threshold (3) exceeded for IP: ${meta.ipAddress}`, 'CRITICAL');
        await delay(jitter());
        emit(`[LOCK] Atomic Account Lock engaged → user "${user.username}" locked for 30 minutes`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Blacklisting IP: ${meta.ipAddress} [${meta.geoLocation}]`, 'CRITICAL');
        user.accountLocked = true;

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'NOSQL_INJECTION') {
        trustDelta = 0; threatDelta = 3;
        effectOnSafety = 'Malformed NoSQL operators found in POST payload. Joi validation stripped the attack before it reached MongoDB collections. No DB queries executed.';
        securityRating = 'A (Joi Schema Validator)';

        emit(`[REQ] POST /auth/login received from ${meta.ipAddress} (${meta.geoLocation})`, 'INFO');
        await delay(jitter());
        emit(`[REQ] Content-Type: application/json — Payload size: ${Math.floor(Math.random() * 200) + 180} bytes`, 'INFO');
        await delay(jitter());
        emit(`[VAL] Forwarding body to Joi Schema Validator (v17.9.2)...`, 'INFO');
        await delay(jitter());
        emit(`[VAL] Scanning for banned NoSQL operators: $gt, $ne, $eq, $or, $where...`, 'INFO');
        await delay(jitter());
        emit(`[VAL] 🚨 MATCH — payload contains: { "username": { "$ne": null }, "password": { "$gt": "" } }`, 'CRITICAL');
        await delay(jitter());
        emit(`[VAL] Joi validation FAILED — schema expects type:string, received type:object`, 'CRITICAL');
        await delay(jitter());
        emit(`[BLOCK] Request terminated at middleware layer. Backend DB not reached.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] NoSQL Injection via ${meta.isp} → fingerprint: ${meta.deviceFingerprint.substring(0, 16)}`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'TOKEN_REPLAY') {
        trustDelta = -10; threatDelta = 5;
        effectOnSafety = 'Attacker replayed an expired JWT. Redis denylist O(1) lookup instantly flagged the JTI. Session forcefully invalidated.';
        securityRating = 'A+ (Redis JTI Denylist)';

        const fakeJti = crypto.randomBytes(8).toString('hex');
        emit(`[TOKEN] Authorization header received — Bearer token present`, 'INFO');
        await delay(jitter());
        emit(`[TOKEN] Verifying HS256 JWT signature using server secret...`, 'INFO');
        await delay(jitter());
        emit(`[TOKEN] Signature valid ✓ — Decoding payload claims...`, 'INFO');
        await delay(jitter());
        emit(`[TOKEN] Extracted JTI: ${fakeJti}`, 'INFO');
        await delay(jitter());
        emit(`[REDIS] Querying Redis denylist → KEY: revoked:${fakeJti}`, 'INFO');
        await delay(jitter());
        emit(`[REDIS] 🚨 HIT — JTI found in blacklist. Token was revoked at 11:42:18 UTC`, 'CRITICAL');
        await delay(jitter());
        emit(`[BLOCK] Replayed token rejected. Session invalidated. Issuing 401 UNAUTHORIZED.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Replay attack from ${meta.ipAddress} logged. Trust score penalized: -10pts`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'CROSS_ZONE_MANIPULATION') {
        trustDelta = -10; threatDelta = 4;
        effectOnSafety = 'Attacker attempted cross-zone infrastructure mutation. RBAC + Zero Trust zone policy denied access and logged the incident.';
        securityRating = 'A (Zero Trust Zone Policy)';

        emit(`[ZONE] Inbound mutation request: PUT /zones/water-zone-4/status`, 'INFO');
        await delay(jitter());
        emit(`[ZONE] Authenticated user: ${user.username} | Role: ${user.role}`, 'INFO');
        await delay(jitter());
        emit(`[ZONE] Loading zone policy matrix for target: "water-zone-4"...`, 'INFO');
        await delay(jitter());
        emit(`[ZONE] Required access domain: WaterAdmin, SuperAdmin`, 'INFO');
        await delay(jitter());
        emit(`[ZONE] 🚨 MISMATCH — Caller domain "TrafficAdmin" not authorized for zone "water-zone-4"`, 'WARNING');
        await delay(jitter());
        emit(`[ZONE] Cross-zone mutation vector identified. Flagging for threat engine...`, 'CRITICAL');
        await delay(jitter());
        emit(`[BLOCK] Request denied by Zero Trust Zone Enforcement policy. HTTP 403.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Anomalous cross-zone access from IP ${meta.ipAddress} recorded.`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'PRIVILEGE_ESCALATION') {
        trustDelta = -12; threatDelta = 6;
        effectOnSafety = 'Low privilege JWT attempted to reach SuperAdmin-only endpoint. RBAC layer terminated the request and flagged the session.';
        securityRating = 'A+ (RBAC Integrity Engine)';

        emit(`[RBAC] Request: POST /api/admin/system/reset from ${meta.ipAddress}`, 'INFO');
        await delay(jitter());
        emit(`[RBAC] Token decoded — role: "SecurityAnalyst"`, 'INFO');
        await delay(jitter());
        emit(`[RBAC] Checking authorizeRoles middleware: ["SuperAdmin"]`, 'INFO');
        await delay(jitter());
        emit(`[RBAC] 🚨 DENIED — Caller role "SecurityAnalyst" not in allowed roles list`, 'CRITICAL');
        await delay(jitter());
        emit(`[RBAC] Privilege escalation pattern detected — divergence: 2 role tiers`, 'CRITICAL');
        await delay(jitter());
        emit(`[TRUST] Adjusting device trust score: ${trustBefore} → ${trustBefore + trustDelta}`, 'WARNING');
        await delay(jitter());
        emit(`[BLOCK] Request terminated at authorizeRoles() middleware layer. HTTP 403.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Escalation event sent to SOC stream. Incident: INC-${randomRequestId().substring(0, 5)}`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'EMERGENCY_OVERRIDE_ABUSE') {
        trustDelta = -15; threatDelta = 7;
        effectOnSafety = 'Emergency override API called without active emergency status. Approval gate and role verification prevented unauthorized activation.';
        securityRating = 'A+ (Emergency Gate)';

        emit(`[EMG] POST /api/emergency/override/activate received`, 'INFO');
        await delay(jitter());
        emit(`[EMG] Validating active emergency status in system state DB...`, 'INFO');
        await delay(jitter());
        emit(`[EMG] System State: NO ACTIVE EMERGENCY declared`, 'INFO');
        await delay(jitter());
        emit(`[EMG] 🚨 ABORT — Override cannot activate: no declared emergency exists`, 'CRITICAL');
        await delay(jitter());
        emit(`[EMG] Checking dual-approval requirement: approver tokens missing`, 'WARNING');
        await delay(jitter());
        emit(`[BLOCK] Emergency override rejected — all gate conditions failed. HTTP 403.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Unauthorized override attempt from ${meta.ipAddress} logged.`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'FINGERPRINT_CHANGE') {
        trustDelta = -8; threatDelta = 3;
        effectOnSafety = 'Device fingerprint changed mid-session, indicating a session hijack attempt. Zero Trust re-validation policy rejected the mismatched device.';
        securityRating = 'A (Device Fingerprint Guard)';

        const origFp = crypto.randomBytes(8).toString('hex');
        const newFp = meta.deviceFingerprint.substring(0, 16);
        emit(`[FP] Session continuation request received from ${meta.ipAddress}`, 'INFO');
        await delay(jitter());
        emit(`[FP] Loading stored device fingerprint from session store...`, 'INFO');
        await delay(jitter());
        emit(`[FP] Stored fingerprint : ${origFp}XXXXXXXX`, 'INFO');
        await delay(jitter());
        emit(`[FP] Incoming fingerprint: ${newFp}XXXXXXXX`, 'INFO');
        await delay(jitter());
        emit(`[FP] 🚨 MISMATCH — Fingerprint divergence detected. Possible session hijack.`, 'CRITICAL');
        await delay(jitter());
        emit(`[FP] Zero Trust policy: re-authentication required on fingerprint change`, 'WARNING');
        await delay(jitter());
        emit(`[BLOCK] Session forcefully terminated. User must re-authenticate. HTTP 401.`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'API_RATE_SPIKE') {
        trustDelta = -5; threatDelta = 4;
        effectOnSafety = 'Burst of 50+ requests from single IP within 1 second detected. Rate limiting middleware blocked the IP for 15 minutes.';
        securityRating = 'A (Rate Limit Guard)';

        emit(`[RATE] Traffic spike detected from ${meta.ipAddress}`, 'INFO');
        await delay(jitter());
        emit(`[RATE] Measuring request rate: window = 1s, limit = 20 req/sec`, 'INFO');
        await delay(jitter());
        emit(`[RATE] Current rate measured: 52 req/s (2.6× above allowed threshold)`, 'WARNING');
        await delay(jitter());
        emit(`[RATE] 🚨 THRESHOLD BREACHED — activating express-rate-limit handler`, 'CRITICAL');
        await delay(jitter());
        emit(`[RATE] IP ${meta.ipAddress} added to throttle list. Block duration: 15 minutes`, 'CRITICAL');
        await delay(jitter());
        emit(`[RATE] Returning HTTP 429 Too Many Requests to all subsequent calls`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Rate spike event saved. Origin ISP: ${meta.isp}`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'UNAUTHORIZED_MONITORING') {
        trustDelta = -6; threatDelta = 3;
        effectOnSafety = 'Unauthorized polling of live sensor/CCTV streams attempted. Zero Trust endpoint guard and audit logger blocked the access.';
        securityRating = 'A (Sensor Stream Guard)';

        emit(`[MON] GET /api/cctv/live-stream/zone-3 from ${meta.ipAddress}`, 'INFO');
        await delay(jitter());
        emit(`[MON] Evaluating authorization for sensor stream access...`, 'INFO');
        await delay(jitter());
        emit(`[MON] Required roles: CCTVOperator, SuperAdmin`, 'INFO');
        await delay(jitter());
        emit(`[MON] 🚨 Current role "WaterAdmin" does not have stream access permissions`, 'CRITICAL');
        await delay(jitter());
        emit(`[MON] Access denied. Live stream endpoint protected.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Unauthorized monitoring attempt from session: ${meta.sessionId}`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else if (type === 'INFRA_SABOTAGE') {
        trustDelta = -18; threatDelta = 8;
        effectOnSafety = 'Attacker attempted to write malicious commands directly to infrastructure control endpoints. Schema validation + RBAC stopped the payload cold.';
        securityRating = 'A+ (Infra Control Guard)';

        emit(`[INFRA] PUT /api/grid/zones/power-zone-1/config received`, 'INFO');
        await delay(jitter());
        emit(`[INFRA] Payload size: 1432 bytes — scanning for injection patterns...`, 'INFO');
        await delay(jitter());
        emit(`[INFRA] 🚨 MALICIOUS PAYLOAD DETECTED: { "voltageOverride": 9999, "disableCircuitBreaker": true }`, 'CRITICAL');
        await delay(jitter());
        emit(`[INFRA] Joi schema: "voltageOverride" max value = 500. Received: 9999. REJECTED.`, 'CRITICAL');
        await delay(jitter());
        emit(`[INFRA] "disableCircuitBreaker" field not permitted in schema. STRIPPED.`, 'WARNING');
        await delay(jitter());
        emit(`[RBAC] Endpoint requires InfraAdmin or SuperAdmin. Caller: SecurityAnalyst. DENIED.`, 'CRITICAL');
        await delay(jitter());
        emit(`[BLOCK] Infrastructure sabotage attempt fully blocked. No state changes applied.`, 'CRITICAL');
        await delay(jitter());
        emit(`[AUDIT] Incident INC-${randomRequestId().substring(0, 5)} escalated. Notifying SOC.`, 'CRITICAL');

        // ─────────────────────────────────────────────────────────────────────
    } else {
        trustDelta = -5; threatDelta = 5;
        effectOnSafety = 'Suspicious traffic pattern detected and blocked via perimeter threat engine.';
        securityRating = 'A (Threat Engine)';

        emit(`[THREAT] Unknown attack vector detected: ${type} from ${meta.ipAddress}`, 'INFO');
        await delay(jitter());
        emit(`[THREAT] Calculating behavioral divergence from zero-trust baseline...`, 'WARNING');
        await delay(jitter());
        emit(`[THREAT] 🚨 Anomaly confirmed. Flagging session for SOC review.`, 'CRITICAL');
    }

    // ── Apply deltas ──────────────────────────────────────────────────────
    user.deviceTrustScore += trustDelta;
    systemState.value += threatDelta;
    await user.save();
    await systemState.save();

    // ── Final summary log ─────────────────────────────────────────────────
    await delay(jitter());
    emit(`─────────────────────────────────────────────`, 'INFO');
    await delay(500);

    const logData = {
        attackId: crypto.randomUUID(),
        attackType: type,
        severity: 'CRITICAL',
        ipAddress: meta.ipAddress,
        geoLocation: meta.geoLocation,
        deviceFingerprint: meta.deviceFingerprint,
        userId: user._id,
        role: user.role,
        targetEndpoint: '/internal/simulated',
        responseCode: 403,
        safeguardTriggered: true,
        trustBefore,
        trustAfter: user.deviceTrustScore,
        threatBefore,
        threatAfter: systemState.value,
        systemStatus: 'SAFEGUARDED',
        effectOnSafety,
        securityRating
    };

    await SecurityLog.create(logData);
    if (io) io.emit('security-log', logData);

    // ── Restore ───────────────────────────────────────────────────────────
    await delay(1800);
    await restoreState(user, systemState, snapshot);

    if (io) io.emit('security-log', {
        timestamp: new Date(),
        message: `✅ System state restored to pre-drill baseline. Trust: ${trustBefore} | Threat: ${threatBefore}`,
        severity: 'INFO',
        internal: true
    });

    return { success: true };
}

module.exports = { simulateAttack };
