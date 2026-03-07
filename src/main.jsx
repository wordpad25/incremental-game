import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function MockHarness() {
    const simulateReview = (rating = 3) => {
        window.dispatchEvent(new CustomEvent('flashquest:card-reviewed', {
            detail: { rating, card: { front: 'Test Front', back: 'Test Back' } }
        }));
    };

    const rapidFire = () => {
        let i = 0;
        const ratings = [3, 3, 4, 2, 3]; // Mix of ratings
        const interval = setInterval(() => {
            simulateReview(ratings[i % ratings.length]);
            i++;
            if (i >= 5) clearInterval(interval);
        }, 200);
    };

    const buttonBase = {
        color: 'white',
        border: 'none',
        borderRadius: '1rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 800,
        cursor: 'pointer',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
        width: '100%',
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100vh',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            background: '#0f172a',
        }}>
            {/* Mock Flashcard Area */}
            <div style={{
                flex: 2,
                background: '#1e293b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '1rem',
                borderRight: '2px solid #334155',
            }}>
                <div style={{
                    background: '#0f172a',
                    borderRadius: '1.5rem',
                    border: '2px solid #334155',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <p style={{ color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        MOCK FLASHCARD (Standalone Dev Mode)
                    </p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e2e8f0' }}>Incremental Game</h2>
                    <div style={{ height: '2px', width: '60px', background: '#334155', margin: '1rem auto', borderRadius: '1rem' }}></div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14b8a6' }}>Simulate SRS to get Gems</p>
                </div>

                {/* Rating Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxWidth: '500px', width: '100%' }}>
                    <button onClick={() => simulateReview(1)} style={{ ...buttonBase, background: '#ef4444', borderBottom: '4px solid #dc2626' }}>
                        ❌ Again (1)
                    </button>
                    <button onClick={() => simulateReview(2)} style={{ ...buttonBase, background: '#f97316', borderBottom: '4px solid #ea580c' }}>
                        😓 Hard (2)
                    </button>
                    <button onClick={() => simulateReview(3)} style={{ ...buttonBase, background: '#14b8a6', borderBottom: '4px solid #0d9488' }}>
                        ✅ Good (3)
                    </button>
                    <button onClick={() => simulateReview(4)} style={{ ...buttonBase, background: '#3b82f6', borderBottom: '4px solid #2563eb' }}>
                        ⚡ Easy (4)
                    </button>
                </div>

                <button
                    onClick={rapidFire}
                    style={{
                        ...buttonBase,
                        background: '#7c3aed',
                        borderBottom: '4px solid #6d28d9',
                        maxWidth: '500px',
                    }}
                >
                    🔥 Rapid Fire (×5 Mixed Ratings)
                </button>
            </div>

            {/* Actual Game Component */}
            <div style={{ flex: 1, minHeight: '300px' }}>
                <App />
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <MockHarness />
    </StrictMode>,
)
