import { useState, useEffect, useRef, useCallback } from 'react';
import { loadStateFromAPI, saveStateToAPI } from '../utils/api';
import { MILESTONES } from '../data/milestones';
import { GENERATORS, calcGeneratorCost, COST_GROWTH } from '../data/generators';
import { ERAS, getNextEra } from '../data/eras';
import { EXPEDITIONS } from '../data/expeditions';

export const AUTOSAVE_INTERVAL_MS = 60000;
export const OFFLINE_EFFICIENCY = 0.5;
export const MAX_OFFLINE_SECONDS = 28800; // 8 hours
export const FRENZY_MAX_STACKS = 20;
export const FRENZY_DECAY_MS = 15000;
export const FRENZY_BONUS_PER_STACK = 0.10;
export const MILESTONE_BANNER_DURATION_MS = 3500;

export function useGameState() {
    const [isLoading, setIsLoading] = useState(true);
    const [offlineReport, setOfflineReport] = useState(null);
    const [saveFlash, setSaveFlash] = useState(false);
    const [fragmentFlash, setFragmentFlash] = useState(false);

    // Core resources
    const [fragments, setFragments] = useState(0);
    const [insightGems, setInsightGems] = useState(0);
    const [clickPower, setClickPower] = useState(1);
    const [globalMultiplier, setGlobalMultiplier] = useState(1);

    // Generators map to state
    const [generatorsArray, setGeneratorsArray] = useState(
        GENERATORS.reduce((acc, g) => ({ ...acc, [g.key]: 0 }), {})
    );

    // Gem upgrades
    const [synergyLevel, setSynergyLevel] = useState(0);
    const [discountLevel, setDiscountLevel] = useState(0);
    const [fortuneLevel, setFortuneLevel] = useState(0);

    // Frenzy
    const [frenzyStacks, setFrenzyStacks] = useState(0);
    const [frenzyDecayAt, setFrenzyDecayAt] = useState(null);

    // Prestige
    const [epiphanies, setEpiphanies] = useState(0);
    const [totalResets, setTotalResets] = useState(0);

    // Enlightenment (Prestige Layer 2)
    const [enlightenments, setEnlightenments] = useState(0);

    // Eras
    const [era, setEra] = useState(1);
    const [pendingEraAdvance, setPendingEraAdvance] = useState(null);

    // Stats
    const [totalCardsReviewed, setTotalCardsReviewed] = useState(0);
    const [totalFragmentsEarned, setTotalFragmentsEarned] = useState(0);
    const [totalGemsEarned, setTotalGemsEarned] = useState(0);
    const [totalClicks, setTotalClicks] = useState(0);

    // Expeditions
    const [activeExpeditionId, setActiveExpeditionId] = useState(null);
    const [expeditionProgress, setExpeditionProgress] = useState(0);
    const [completedExpeditions, setCompletedExpeditions] = useState([]);

    // Streaks & Combos
    const [streak, setStreak] = useState(0);
    const [lastStudyDate, setLastStudyDate] = useState(null);
    const [comboCount, setComboCount] = useState(0);
    const [focusBurstTime, setFocusBurstTime] = useState(0);

    // Milestones
    const [completedMilestones, setCompletedMilestones] = useState({});
    const [milestoneBannerQueue, setMilestoneBannerQueue] = useState([]);
    const [activeBanner, setActiveBanner] = useState(null);

    // Ref for interval access
    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            fragments, insightGems, clickPower, globalMultiplier,
            generators: generatorsArray,
            synergyLevel, discountLevel, fortuneLevel,
            frenzyStacks, frenzyDecayAt,
            epiphanies, totalResets,
            enlightenments,
            totalCardsReviewed, totalFragmentsEarned, totalGemsEarned, totalClicks,
            completedMilestones,
            era,
            activeExpeditionId, expeditionProgress, completedExpeditions,
            streak, lastStudyDate, comboCount, focusBurstTime,
        };
    });

    // ─── Milestone Banner Queue Processor ────────────────────
    useEffect(() => {
        if (activeBanner || milestoneBannerQueue.length === 0) return;
        const next = milestoneBannerQueue[0];
        setActiveBanner(next);
        setMilestoneBannerQueue(prev => prev.slice(1));
        const timer = setTimeout(() => setActiveBanner(null), MILESTONE_BANNER_DURATION_MS);
        return () => clearTimeout(timer);
    }, [activeBanner, milestoneBannerQueue]);

    // ─── Shared Calculations ─────────────────────────────────
    function getCalcFragmentsPerSec(stateSnapshot) {
        const g = stateSnapshot.generators || {};
        const base = GENERATORS.reduce((sum, gen) => sum + (g[gen.key] || 0) * gen.production, 0);
        const epiphanyMult = 1 + ((stateSnapshot.epiphanies || 0) * 0.5);
        const enlightenMult = Math.pow(2, stateSnapshot.enlightenments || 0);
        return base * (stateSnapshot.globalMultiplier || 1) * epiphanyMult * enlightenMult;
    }

    // ─── Check Milestones ────────────────────────────────────
    const checkMilestones = useCallback((triggerSave = false) => {
        const s = stateRef.current;
        const completed = s.completedMilestones || {};
        const newlyCompleted = [];

        // Note: milestone conditions expect a flat state object, so let's provide proxies for the generator keys
        const conditionState = {
            ...s,
            ...s.generators,
        };

        for (const m of MILESTONES) {
            if (completed[m.id]) continue;
            if (m.condition(conditionState)) {
                newlyCompleted.push(m);
            }
        }

        if (newlyCompleted.length > 0) {
            const updatedCompleted = { ...completed };
            for (const m of newlyCompleted) {
                updatedCompleted[m.id] = true;
                if (m.rewardType === 'fragments') {
                    setFragments(prev => prev + m.rewardAmount);
                    setTotalFragmentsEarned(prev => prev + m.rewardAmount);
                } else if (m.rewardType === 'gems') {
                    setInsightGems(prev => prev + m.rewardAmount);
                    setTotalGemsEarned(prev => prev + m.rewardAmount);
                }
            }
            setCompletedMilestones(updatedCompleted);
            setMilestoneBannerQueue(prev => [...prev, ...newlyCompleted]);
            if (triggerSave) {
                setTimeout(() => saveNow(), 200);
            }
        }
    }, []);

    // ─── Collect state ───────────────────────────────────────
    const collectState = useCallback(() => ({
        version: 1,
        lastSaveTimestamp: Date.now(),
        fragments: stateRef.current.fragments,
        insightGems: stateRef.current.insightGems,
        clickPower: stateRef.current.clickPower,
        globalMultiplier: stateRef.current.globalMultiplier,
        generators: stateRef.current.generators,
        gemUpgrades: {
            synergyLevel: stateRef.current.synergyLevel,
            discountLevel: stateRef.current.discountLevel,
            fortuneLevel: stateRef.current.fortuneLevel,
        },
        frenzy: {
            stacks: stateRef.current.frenzyStacks,
            expiresAt: stateRef.current.frenzyDecayAt,
        },
        prestige: {
            epiphanies: stateRef.current.epiphanies,
            totalResets: stateRef.current.totalResets,
        },
        enlightenment: {
            level: stateRef.current.enlightenments,
        },
        era: stateRef.current.era,
        expeditions: {
            activeId: stateRef.current.activeExpeditionId,
            progress: stateRef.current.expeditionProgress,
            completed: stateRef.current.completedExpeditions,
        },
        streaks: {
            current: stateRef.current.streak,
            lastDate: stateRef.current.lastStudyDate,
        },
        stats: {
            totalCardsReviewed: stateRef.current.totalCardsReviewed,
            totalFragmentsEarned: stateRef.current.totalFragmentsEarned,
            totalGemsEarned: stateRef.current.totalGemsEarned,
            totalClicks: stateRef.current.totalClicks,
        },
        milestones: stateRef.current.completedMilestones,
    }), []);

    // ─── Save ────────────────────────────────────────────────
    const saveNow = useCallback(async () => {
        const state = collectState();
        await saveStateToAPI(state);
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1500);
    }, [collectState]);

    // ─── Hydrate ─────────────────────────────────────────────
    const hydrateState = useCallback((s) => {
        setFragments(s.fragments ?? 0);
        setInsightGems(s.insightGems ?? 0);
        setClickPower(s.clickPower ?? 1);
        setGlobalMultiplier(s.globalMultiplier ?? 1);

        const loadedGen = s.generators || {};
        const newGens = {};
        for (const gen of GENERATORS) {
            newGens[gen.key] = loadedGen[gen.key] ?? 0;
        }
        setGeneratorsArray(newGens);

        const gu = s.gemUpgrades || {};
        setSynergyLevel(gu.synergyLevel ?? 0);
        setDiscountLevel(gu.discountLevel ?? 0);
        setFortuneLevel(gu.fortuneLevel ?? 0);

        const fr = s.frenzy || {};
        if (fr.expiresAt && Date.now() > fr.expiresAt) {
            setFrenzyStacks(0);
            setFrenzyDecayAt(null);
        } else {
            setFrenzyStacks(fr.stacks ?? 0);
            setFrenzyDecayAt(fr.expiresAt ?? null);
        }

        const p = s.prestige || {};
        setEpiphanies(p.epiphanies ?? 0);
        setTotalResets(p.totalResets ?? 0);

        const e = s.enlightenment || {};
        setEnlightenments(e.level ?? 0);

        setEra(s.era ?? 1);

        const st = s.stats || {};
        setTotalCardsReviewed(st.totalCardsReviewed ?? 0);
        setTotalFragmentsEarned(st.totalFragmentsEarned ?? 0);
        setTotalGemsEarned(st.totalGemsEarned ?? 0);
        setTotalClicks(st.totalClicks ?? 0);

        // Milestones
        setCompletedMilestones(s.milestones ?? {});

        const ex = s.expeditions || {};
        setActiveExpeditionId(ex.activeId ?? null);
        setExpeditionProgress(ex.progress ?? 0);
        setCompletedExpeditions(ex.completed ?? []);

        const sr = s.streaks || {};
        setStreak(sr.current ?? 0);
        setLastStudyDate(sr.lastDate ?? null);

        // Check streak on load
        if (sr.lastDate) {
            const last = new Date(sr.lastDate);
            const now = new Date();
            const diff = now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
            const oneDay = 24 * 60 * 60 * 1000;
            if (diff > oneDay * 2) {
                setStreak(0); // Lost streak
            } else if (diff === oneDay) {
                // Streak maintained but not yet incremented for today
            }
        }
    }, []);

    // ─── Load on mount ───────────────────────────────────────
    useEffect(() => {
        (async () => {
            const saved = await loadStateFromAPI();
            if (saved) {
                const fps = getCalcFragmentsPerSec(saved);
                let offlineFragments = 0;
                let offlineSeconds = 0;
                if (saved.lastSaveTimestamp && fps > 0) {
                    offlineSeconds = Math.max(0, Math.min(
                        (Date.now() - saved.lastSaveTimestamp) / 1000,
                        MAX_OFFLINE_SECONDS
                    ));
                    if (offlineSeconds > 60) {
                        const eff = (saved.enlightenment?.level || 0) >= 4 ? 0.75 : OFFLINE_EFFICIENCY;
                        offlineFragments = Math.floor(fps * offlineSeconds * eff);
                        saved.fragments = (saved.fragments || 0) + offlineFragments;
                        setOfflineReport({ seconds: offlineSeconds, fragments: offlineFragments });
                    }
                }
                hydrateState(saved);
            }
            setIsLoading(false);
        })();
    }, [hydrateState]);

    // ─── Autosave ────────────────────────────────────────────
    useEffect(() => {
        if (isLoading) return;
        const interval = setInterval(() => saveNow(), AUTOSAVE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isLoading, saveNow]);

    // ─── Save on visibility / unload ─────────────────────────
    useEffect(() => {
        if (isLoading) return;
        const handleVisChange = () => {
            if (document.visibilityState === 'hidden') saveNow();
        };
        const handleUnload = () => {
            const state = collectState();
            const blob = new Blob([JSON.stringify({ state })], { type: 'application/json' });
            // API_BASE from utils/api. GAME_ID too. We must import GAME_ID, API_BASE.
            // But they are exported from api.js. Wait, we exported GAME_ID and API_BASE from api.js.
            // Let's fix that inline.
        };
        document.addEventListener('visibilitychange', handleVisChange);
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisChange);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [isLoading, saveNow, collectState]);

    // ─── SRS event ───────────────────────────────────────────
    useEffect(() => {
        const handleCardReviewed = (event) => {
            const { globalMultiplier, fortuneLevel, frenzyStacks, epiphanies, enlightenments } = stateRef.current;
            const rating = event?.detail?.rating ?? 3; // Default to Good if missing

            const RATING_MULTIPLIERS = { 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.5 };
            const ratingMult = RATING_MULTIPLIERS[rating] ?? 1.0;

            const easyGemBonus = rating === 4 ? 0.10 : 0;
            const expGemBonus = completedExpeditions.some(id => id === 'exp_rosetta') ? 0.05 : 0;
            const gemAmount = (Math.random() < (fortuneLevel * 0.05 + easyGemBonus + expGemBonus)) ? 2 : 1;
            setInsightGems(prev => prev + gemAmount);
            setTotalGemsEarned(prev => prev + gemAmount);

            // Update Mastery Combo
            if (rating === 4) {
                setComboCount(prev => {
                    const next = prev + 1;
                    if (next >= 5) {
                        setFocusBurstTime(10);
                        return 0; // Reset after trigger
                    }
                    return next;
                });
            } else {
                setComboCount(0); // Break combo on non-easy
            }

            // Update Streak
            const today = new Date().toISOString().split('T')[0];
            if (lastStudyDate !== today) {
                setStreak(prev => prev + 1);
                setLastStudyDate(today);
            }

            const epiphanyMult = 1 + (epiphanies * 0.5);
            const enlightenMult = Math.pow(2, enlightenments);
            const frenzyMult = 1 + (frenzyStacks * FRENZY_BONUS_PER_STACK);
            const expGlobalMult = completedExpeditions.some(id => id === 'exp_voyager') ? 1.5 : 1.0;
            const burstAmount = 10 * globalMultiplier * expGlobalMult * frenzyMult * epiphanyMult * enlightenMult * ratingMult;
            setFragments(prev => prev + burstAmount);
            setTotalFragmentsEarned(prev => prev + burstAmount);
            setTotalCardsReviewed(prev => prev + 1);

            const frenzyStacksToAdd = rating === 4 ? 2 : 1;
            setFrenzyStacks(prev => Math.min(prev + frenzyStacksToAdd, FRENZY_MAX_STACKS));
            setFrenzyDecayAt(Date.now() + FRENZY_DECAY_MS);

            // Update Expedition Progress
            if (activeExpeditionId) {
                const draft = EXPEDITIONS.find(e => e.id === activeExpeditionId);
                setExpeditionProgress(prev => {
                    const next = prev + 1;
                    if (draft && next >= draft.steps) {
                        setCompletedExpeditions(c => [...c, activeExpeditionId]);
                        setActiveExpeditionId(null);
                        return 0;
                    }
                    return next;
                });
            }

            const el = document.getElementById('gem-container');
            if (el) { el.classList.remove('animate-pulse'); void el.offsetWidth; el.classList.add('animate-pulse'); }

            // Check for Era advancement
            const next = getNextEra(stateRef.current.era, getCalcFragmentsPerSec(stateRef.current), stateRef.current.totalCardsReviewed + 1);
            if (next && !pendingEraAdvance) {
                setPendingEraAdvance(next);
            }

            setTimeout(() => checkMilestones(true), 50);
        };
        window.addEventListener('flashquest:card-reviewed', handleCardReviewed);
        return () => window.removeEventListener('flashquest:card-reviewed', handleCardReviewed);
    }, [checkMilestones]);

    // ─── Passive generation + frenzy decay + Automations ───────
    useEffect(() => {
        let tickCount = 0;
        const interval = setInterval(() => {
            const s = stateRef.current;
            tickCount++;

            if (s.frenzyStacks > 0 && s.frenzyDecayAt && Date.now() > s.frenzyDecayAt) {
                setFrenzyStacks(prev => {
                    const next = prev - 1;
                    if (next <= 0) { setFrenzyDecayAt(null); return 0; }
                    setFrenzyDecayAt(Date.now() + FRENZY_DECAY_MS);
                    return next;
                });
            }

            const fps = getCalcFragmentsPerSec(s);
            const frenzyMultiplier = 1 + (s.frenzyStacks * FRENZY_BONUS_PER_STACK);
            const expGlobalMult = s.completedExpeditions.some(id => id === 'exp_voyager') ? 1.5 : 1.0;
            const generated = fps * frenzyMultiplier * expGlobalMult;

            if (generated > 0) {
                setFragments(prev => prev + generated);
                setTotalFragmentsEarned(prev => prev + generated);
            }

            // Focus Burst Decay
            if (s.focusBurstTime > 0) {
                setFocusBurstTime(prev => prev - 1);
            }

            // Auto Clicker (enlightenment 1, 3)
            if (s.enlightenments >= 1) {
                const clickPower = s.clickPower + s.synergyLevel;
                const eMult = Math.pow(2, s.enlightenments);
                const epMult = 1 + (s.epiphanies * 0.5);
                const clickRate = s.enlightenments >= 3 ? 5 : 1;
                const expGlobalMult = s.completedExpeditions.some(id => id === 'exp_voyager') ? 1.5 : 1.0;
                const expClickMult = s.completedExpeditions.some(id => id === 'exp_apollo') ? 1.2 : 1.0;
                const autoClickVal = clickPower * s.globalMultiplier * expGlobalMult * frenzyMultiplier * epMult * eMult * clickRate * expClickMult;

                setFragments(prev => prev + autoClickVal);
                setTotalFragmentsEarned(prev => prev + autoClickVal);
                setTotalClicks(prev => prev + clickRate); // stats
            }

            // Auto Buyer (enlightenment 2, 5) - runs every 5 sec
            if (s.enlightenments >= 2 && tickCount % 5 === 0) {
                const strategy = s.enlightenments >= 5 ? 'best' : 'cheapest';
                const discountMult = Math.pow(0.9, s.discountLevel);

                let affordable = [];
                for (const gen of GENERATORS) {
                    if (gen.unlockAfter && !(s.generators[gen.unlockAfter] > 0)) continue;
                    const cost = calcGeneratorCost(gen.baseCost, s.generators[gen.key] || 0, discountMult);
                    if (s.fragments >= cost) {
                        affordable.push({ key: gen.key, cost, production: gen.production });
                    }
                }

                if (affordable.length > 0) {
                    affordable.sort((a, b) => strategy === 'best' ? b.production - a.production : a.cost - b.cost);
                    const target = affordable[0];
                    setFragments(prev => prev - target.cost);
                    setGeneratorsArray(prev => ({ ...prev, [target.key]: (prev[target.key] || 0) + 1 }));
                }
            }

            checkMilestones(false);
        }, 1000);
        return () => clearInterval(interval);
    }, [checkMilestones]);

    // ─── Derived Math ────────────────────────────────────────
    const expDiscount = completedExpeditions.some(id => id === 'exp_silk_road') ? 0.95 : 1.0;
    const discountMult = Math.pow(0.9, discountLevel) * expDiscount;
    const clickPowerCost = Math.floor((50 * Math.pow(1.5, clickPower - 1)) * discountMult);
    const multiplierCost = Math.floor(2 * Math.pow(1.5, globalMultiplier - 1));
    const synergyCost = Math.floor(2 * Math.pow(1.35, synergyLevel));
    const discountCost = Math.floor(3 * Math.pow(1.35, discountLevel));
    const fortuneCost = Math.floor(5 * Math.pow(1.5, fortuneLevel));
    const insightBurstCost = 3;

    const epiphanyMult = 1 + (epiphanies * 0.5);
    const enlightenMult = Math.pow(2, enlightenments);
    const frenzyMultiplier = 1 + (frenzyStacks * FRENZY_BONUS_PER_STACK);

    const expClickMult = completedExpeditions.some(id => id === 'exp_apollo') ? 1.2 : 1.0;
    const baseClick = (clickPower + synergyLevel) * expClickMult;

    const expGlobalMult = completedExpeditions.some(id => id === 'exp_voyager') ? 1.5 : 1.0;
    const streakMult = 1 + (Math.min(streak, 10) * 0.05);
    const focusBurstMult = focusBurstTime > 0 ? 2.0 : 1.0;
    const totalGlobalMult = globalMultiplier * expGlobalMult * streakMult * focusBurstMult;

    // Total Fragments Per Sec for UI
    const baseFPS = GENERATORS.reduce((sum, g) => sum + (generatorsArray[g.key] || 0) * g.production, 0);
    const fragmentsPerSec = baseFPS * totalGlobalMult * frenzyMultiplier * epiphanyMult * enlightenMult;

    // ─── Actions ─────────────────────────────────────────────
    const handleManualClick = () => {
        const expGlobalMult = completedExpeditions.some(id => id === 'exp_voyager') ? 1.5 : 1.0;
        const amount = baseClick * globalMultiplier * expGlobalMult * frenzyMultiplier * epiphanyMult * enlightenMult;
        setFragments(prev => prev + amount);
        setTotalFragmentsEarned(prev => prev + amount);
        setTotalClicks(prev => prev + 1);
    };

    const buyWithSave = (fn) => () => { fn(); setTimeout(() => saveNow(), 100); };

    const buyGenerator = (key) => {
        const gen = GENERATORS.find(g => g.key === key);
        if (!gen) return;
        const cost = calcGeneratorCost(gen.baseCost, generatorsArray[key] || 0, discountMult);
        if (fragments >= cost) {
            setFragments(p => p - cost);
            setGeneratorsArray(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        }
    };

    const buyClickPower = () => { if (fragments >= clickPowerCost) { setFragments(p => p - clickPowerCost); setClickPower(p => p + 1); } };
    const buyMultiplier = () => { if (insightGems >= multiplierCost) { setInsightGems(p => p - multiplierCost); setGlobalMultiplier(p => p + 1); } };
    const buySynergy = () => { if (insightGems >= synergyCost) { setInsightGems(p => p - synergyCost); setSynergyLevel(p => p + 1); } };
    const buyDiscount = () => { if (insightGems >= discountCost) { setInsightGems(p => p - discountCost); setDiscountLevel(p => p + 1); } };
    const buyFortune = () => { if (insightGems >= fortuneCost) { setInsightGems(p => p - fortuneCost); setFortuneLevel(p => p + 1); } };
    const buyInsightBurst = () => {
        if (insightGems >= insightBurstCost && fragmentsPerSec > 0) {
            setInsightGems(p => p - insightBurstCost);
            const burstFragments = fragmentsPerSec * 120;
            setFragments(p => p + burstFragments);
            setTotalFragmentsEarned(p => p + burstFragments);
            setFragmentFlash(true);
            setTimeout(() => setFragmentFlash(false), 800);
        }
    };

    // ─── Prestige ────────────────────────────────────────────
    const canPrestige = (generatorsArray.singularities || 0) >= 1;
    const handlePrestige = () => {
        setFragments(0);
        setClickPower(1);
        setGeneratorsArray(GENERATORS.reduce((acc, g) => ({ ...acc, [g.key]: 0 }), {}));
        setFrenzyStacks(0); setFrenzyDecayAt(null);
        setEpiphanies(prev => prev + 1);
        setTotalResets(prev => prev + 1);
        setTimeout(() => {
            checkMilestones(true);
            saveNow();
        }, 200);
    };

    const canEnlighten = epiphanies >= 10;
    const handleEnlighten = () => {
        setFragments(0);
        setClickPower(1);
        setGeneratorsArray(GENERATORS.reduce((acc, g) => ({ ...acc, [g.key]: 0 }), {}));
        setFrenzyStacks(0); setFrenzyDecayAt(null);
        setEpiphanies(0); // This is the massive reset!
        setEnlightenments(prev => prev + 1);
        setTimeout(() => {
            checkMilestones(true);
            saveNow();
        }, 200);
    };

    const handleAdvanceEra = () => {
        if (!pendingEraAdvance) return;
        setEra(pendingEraAdvance.id);
        setPendingEraAdvance(null);
        setTimeout(() => saveNow(), 100);
    };

    const handleStartExpedition = (id) => {
        if (activeExpeditionId) return;
        setActiveExpeditionId(id);
        setExpeditionProgress(0);
        setTimeout(() => saveNow(), 100);
    };

    return {
        // State
        isLoading, offlineReport, saveFlash, fragmentFlash, activeBanner,
        fragments, insightGems, clickPower, globalMultiplier, generatorsArray,
        synergyLevel, discountLevel, fortuneLevel,
        frenzyStacks, epiphanies, totalResets, enlightenments,
        totalCardsReviewed, totalFragmentsEarned, totalGemsEarned, totalClicks,
        era, pendingEraAdvance,
        activeExpeditionId, expeditionProgress, completedExpeditions,
        streak, comboCount, focusBurstTime,
        // Setters for UI flow
        setOfflineReport, setPendingEraAdvance,
        // Derived
        discountMult, clickPowerCost, multiplierCost, synergyCost, discountCost, fortuneCost, insightBurstCost,
        baseClick, fragmentsPerSec, canPrestige, canEnlighten, frenzyMultiplier, epiphanyMult, enlightenMult,
        // Actions
        handleManualClick, buyGenerator, buyClickPower, buyMultiplier, buySynergy, buyDiscount, buyFortune, buyInsightBurst,
        handlePrestige, handleEnlighten, buyWithSave, handleAdvanceEra, handleStartExpedition
    };
}
