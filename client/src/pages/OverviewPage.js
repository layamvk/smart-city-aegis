import React, { useState } from 'react';
import RiskSummary from '../components/RiskSummary';
import LiveEventFeed from '../components/LiveEventFeed';
import InfrastructureSummary from '../components/InfrastructureSummary';
import TopologyPanel from '../components/TopologyPanel';
import DigitalTwinStats from '../components/DigitalTwinStats';

const OverviewPage = () => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="page-layout overview-page">
            {!expanded && (
                <button
                    className="btn-secondary"
                    style={{ position: 'absolute', top: 80, left: 80, zIndex: 100 }}
                    onClick={() => setExpanded(true)}
                >
                    ◧ SHOW ANALYTICS
                </button>
            )}

            {expanded && (
                <>
                    <button
                        className="btn-danger"
                        style={{ position: 'absolute', top: 80, left: 80, zIndex: 100 }}
                        onClick={() => setExpanded(false)}
                    >
                        ◨ HIDE ANALYTICS
                    </button>
                    <div
                        className="left-column dashboard-panel"
                        style={{ marginTop: 50, animationDelay: '100ms' }}
                    >
                        <RiskSummary />
                        <LiveEventFeed />
                    </div>

                    <div className="center-column"></div>

                    <div
                        className="right-column dashboard-panel"
                        style={{ marginTop: 50, animationDelay: '200ms' }}
                    >
                        <InfrastructureSummary />
                        <TopologyPanel />
                        <DigitalTwinStats />
                    </div>
                </>
            )}
        </div>
    );
};

export default OverviewPage;
