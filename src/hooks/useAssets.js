import { useState, useEffect } from 'react';

export default function useAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/data/assets.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load assets');
                return res.json();
            })
            .then(data => {
                // Normalize data to match UI expectations
                const normalizedAssets = data.map(asset => ({
                    ...asset,
                    id: asset.id,
                    name: asset.name,
                    background: asset.background,
                    percent: asset.current, // map current -> percent
                    milestones: asset.milestones.map(m => ({ at: m.completed, text: m.label })),
                    capitalInputs: asset.capitalFlow.filter(c => c.type === 'Input').map(c => {
                        let normalizedType = c.round;
                        if (c.round.includes('Tokens')) normalizedType = c.round.replace('Tokens', 'Token');
                        return {
                            type: normalizedType,
                            label: c.label,
                            val: c.amount / 1000000
                        };
                    }),
                    capitalOutputs: asset.capitalFlow.filter(c => c.type === 'Output').map(c => {
                        let type = 'Equity';
                        if (c.label.includes('Token Offering')) {
                            // Extract "Round X" from "Round X Token Offering"
                            const match = c.label.match(/(Round \d+)/);
                            if (match) type = `${match[1]} Token`;
                        } else if (c.label.includes('Token')) {
                            type = c.label; // Fallback
                        }
                        return {
                            type: type,
                            label: c.label,
                            val: c.percent
                        };
                    }),
                    tokenData: {
                        total: asset.tokenomics.totalTokens,
                        min: asset.tokenomics.exitTargetMin,
                        max: asset.tokenomics.exitTargetMax
                    }
                }));
                setAssets(normalizedAssets);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err);
                setLoading(false);
            });
    }, []);

    return { assets, loading, error };
}
