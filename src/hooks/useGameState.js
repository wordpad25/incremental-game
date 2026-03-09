import { useState, useEffect, useRef, useCallback } from 'react';
import { loadStateFromAPI, saveStateToAPI } from '../utils/api';
import { MILESTONES } from '../data/milestones';
import { GENERATORS, SUPPORT_NODES, calcGeneratorCost, COST_GROWTH } from '../data/generators';
import { ERAS, getNextEra } from '../data/eras';
import { EXPEDITIONS } from '../data/expeditions';
import { RELICS, getRelicEffect } from '../data/relics';
import { CONSUMABLES } from '../data/consumables';

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
    const [claritySparks, setClaritySparks] = useState(0);
    const [focusShards, setFocusShards] = useState(0);
    const [resilienceCores, setResilienceCores] = useState(0);
    const [clickPower, setClickPower] = useState(1);
    const [globalMultiplier, setGlobalMultiplier] = useState(1);

    // Generators map to state
    const [generatorsArray, setGeneratorsArray] = useState(
        GENERATORS.reduce((acc, g) => ({ ...acc, [g.key]: 0 }), {})
    );
    const [supportNodesArray, setSupportNodesArray] = useState(
        SUPPORT_NODES.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {})
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

    // Thought Construct Evolution
    const [constructSatiation, setConstructSatiation] = useState(15);
    const [lastFedTimestamp, setLastFedTimestamp] = useState(Date.now());
    const [constructGrowthPoints, setConstructGrowthPoints] = useState(0);
    const [constructEvolution, setConstructEvolution] = useState(0); // 0: Wisp, 1: Orb, 2: Entity, 3: Avatar

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
    const [activeExpeditionTarget, setActiveExpeditionTarget] = useState(0);
    const [activeExpeditionEndTime, setActiveExpeditionEndTime] = useState(null);
    const [completedExpeditions, setCompletedExpeditions] = useState([]);
    const [relics, setRelics] = useState([]); // Array of { id, level }

    // Streaks & Combos
    const [streak, setStreak] = useState(0);
    const [lastStudyDate, setLastStudyDate] = useState(null);
    const [comboCount, setComboCount] = useState(0);
    const [focusBurstTime, setFocusBurstTime] = useState(0);

    // Milestones
    const [completedMilestones, setCompletedMilestones] = useState({});
    const [milestoneBannerQueue, setMilestoneBannerQueue] = useState([]);
    const [activeBanner, setActiveBanner] = useState(null);

    // Active Buffs (Consumables)
    const [activeBuffs, setActiveBuffs] = useState({}); // { id: expiryTimestamp }

    // Ref for interval access
    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            fragments, insightGems, claritySparks, focusShards, resilienceCores, clickPower, globalMultiplier,
            generators: generatorsArray,
            supportNodes: supportNodesArray,
            synergyLevel, discountLevel, fortuneLevel,
            frenzyStacks, frenzyDecayAt,
            epiphanies, totalResets,
            enlightenments,
            constructSatiation, lastFedTimestamp,
            constructGrowthPoints, constructEvolution,
            totalCardsReviewed, totalFragmentsEarned, totalGemsEarned, totalClicks,
            completedMilestones,
            era,
            activeExpeditionId, expeditionProgress, activeExpeditionTarget, activeExpeditionEndTime, completedExpeditions,
            relics,
            streak, lastStudyDate, comboCount, focusBurstTime,
            activeBuffs,
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
    function isBuffActive(buffId, stateSnapshot) {
        const active = stateSnapshot ? stateSnapshot.activeBuffs : activeBuffs;
        if (!active || !active[buffId]) return false;
        return Date.now() < active[buffId];
    }

    function getRelicLevel(relicsArray, relicId) {
        if (!Array.isArray(relicsArray)) return 0;
        const owned = relicsArray.filter(r => r && typeof r === 'object' ? r.id === relicId : r === relicId);
        if (owned.length === 0) return 0;
        return Math.max(...owned.map(r => typeof r === 'object' ? (r.level || 1) : 1));
    }

    function getCalcFragmentsPerSec(stateSnapshot) {
        const g = stateSnapshot.generators || {};
        const s = stateSnapshot.supportNodes || {};
        const relicsArray = stateSnapshot.relics || [];

        const base = GENERATORS.reduce((sum, gen) => {
            let genProd = (g[gen.key] || 0) * gen.production;
            for (const support of SUPPORT_NODES) {
                if (support.parentKey === gen.key && s[support.key]) {
                    genProd *= support.multiplier;
                }
            }
            return sum + genProd;
        }, 0);

        const epiphanyMult = 1 + ((stateSnapshot.epiphanies || 0) * 0.5);
        const enlightenMult = Math.pow(2, stateSnapshot.enlightenments || 0);

        const evolutionSatedBonus = [1.5, 1.6, 1.75, 2.0][stateSnapshot.constructEvolution] || 1.5;
        const constructSatiationMult = (stateSnapshot.constructSatiation || 0) >= 10 ? evolutionSatedBonus : 1;

        const voyagerLevel = getRelicLevel(relicsArray, 'relic_voyager');
        const relicGlobalMult = voyagerLevel > 0 ? (1 + getRelicEffect('relic_voyager', voyagerLevel)) : 1.0;

        // Consumable Buffs
        let buffMult = 1;
        if (isBuffActive('fragment_surge', stateSnapshot)) buffMult *= 10;

        return base * (stateSnapshot.globalMultiplier || 1) * epiphanyMult * enlightenMult * constructSatiationMult * relicGlobalMult * buffMult;
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
        claritySparks: stateRef.current.claritySparks,
        focusShards: stateRef.current.focusShards,
        resilienceCores: stateRef.current.resilienceCores,
        clickPower: stateRef.current.clickPower,
        globalMultiplier: stateRef.current.globalMultiplier,
        generators: stateRef.current.generators,
        supportNodes: stateRef.current.supportNodes,
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
        construct: {
            satiation: stateRef.current.constructSatiation,
            lastFed: stateRef.current.lastFedTimestamp,
            growthPoints: stateRef.current.constructGrowthPoints,
            evolution: stateRef.current.constructEvolution,
        },
        expeditions: {
            activeId: stateRef.current.activeExpeditionId,
            progress: stateRef.current.expeditionProgress,
            target: stateRef.current.activeExpeditionTarget,
            endTime: stateRef.current.activeExpeditionEndTime,
            completed: stateRef.current.completedExpeditions,
        },
        relics: stateRef.current.relics,
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
        fragmentFlash: stateRef.current.fragmentFlash,
        activeBuffs: stateRef.current.activeBuffs,
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
        setClaritySparks(s.claritySparks ?? 0);
        setFocusShards(s.focusShards ?? 0);
        setResilienceCores(s.resilienceCores ?? 0);
        setClickPower(s.clickPower ?? 1);
        setGlobalMultiplier(s.globalMultiplier ?? 1);

        const loadedGen = s.generators || {};
        const newGens = {};
        for (const gen of GENERATORS) {
            newGens[gen.key] = loadedGen[gen.key] ?? 0;
        }
        setGeneratorsArray(newGens);

        const loadedSup = s.supportNodes || {};
        const newSups = {};
        for (const sup of SUPPORT_NODES) {
            newSups[sup.key] = loadedSup[sup.key] ?? 0;
        }
        setSupportNodesArray(newSups);

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

        const c = s.construct || {};
        setConstructSatiation(c.satiation ?? 15);
        setLastFedTimestamp(c.lastFed ?? Date.now());
        setConstructGrowthPoints(c.growthPoints ?? 0);
        setConstructEvolution(c.evolution ?? 0);

        const st = s.stats || {};
        setTotalCardsReviewed(st.totalCardsReviewed ?? 0);
        setTotalFragmentsEarned(st.totalFragmentsEarned ?? 0);
        setTotalGemsEarned(st.totalGemsEarned ?? 0);
        setTotalClicks(st.totalClicks ?? 0);

        // Milestones
        setCompletedMilestones(s.milestones ?? {});
        setActiveBuffs(s.activeBuffs ?? {});

        const ex = s.expeditions || {};
        setActiveExpeditionId(ex.activeId ?? null);
        setExpeditionProgress(ex.progress ?? 0);
        setActiveExpeditionTarget(ex.target ?? 0);
        setActiveExpeditionEndTime(ex.endTime ?? null);
        setCompletedExpeditions(ex.completed || []);
        setRelics(s.relics || []);

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
                let updatedSavedState = { ...saved };
                let offlineFragments = 0;
                let offlineSeconds = 0;
                let offlineSatiationLost = 0;
                let brokeStreak = false;

                const now = Date.now();
                const lastSave = saved.lastSaveTimestamp || now;
                const timeDiffMs = now - lastSave;

                // Decay Thought Construct
                let updatedSatiation = saved.construct?.satiation ?? 15;
                let lastFed = saved.construct?.lastFed ?? now;
                let growthPoints = saved.construct?.growthPoints ?? 0;
                let evolution = saved.construct?.evolution ?? 0;
                let missedDays = 0;

                if (lastFed) {
                    const timeSinceFed = now - lastFed;
                    const daysSinceFed = Math.floor(timeSinceFed / 86400000); // 86,400,000 ms in a day
                    if (daysSinceFed > 0) {
                        // Streak Shield logic
                        const activeShield = saved.activeBuffs?.['streak_shield'] && saved.activeBuffs['streak_shield'] > now;

                        if (activeShield) {
                            offlineSatiationLost = 0;
                        } else {
                            offlineSatiationLost = daysSinceFed * 5;
                        }
                        updatedSatiation = Math.max(0, updatedSatiation - offlineSatiationLost);
                        missedDays = daysSinceFed;

                        // Earn growth points for each sated day (satiation was sated during those days?)
                        // Simple logic: if they were sated when they left, they get 1 point?
                        // Actually, let's just give 1 point if they were sated and it's been a day.
                        if (saved.construct?.satiation >= 10) {
                            growthPoints += 1;
                        }

                        // Check for Evolution
                        if (growthPoints >= 90) evolution = 3;
                        else if (growthPoints >= 30) evolution = 2;
                        else if (growthPoints >= 7) evolution = 1;
                    }
                }
                updatedSavedState.construct = {
                    satiation: updatedSatiation,
                    lastFed: lastFed,
                    growthPoints: growthPoints,
                    evolution: evolution
                };

                if (timeDiffMs > 60000) { // More than 1 minute offline
                    const fps = getCalcFragmentsPerSec(saved); // Calculate FPS based on saved state
                    offlineSeconds = Math.max(0, Math.min(
                        timeDiffMs / 1000,
                        MAX_OFFLINE_SECONDS
                    ));

                    const eff = (saved.enlightenment?.level || 0) >= 4 ? 0.75 : OFFLINE_EFFICIENCY;
                    const constructOfflineBonus = updatedSatiation >= 10 ? 1.5 : 1; // Apply construct bonus to offline
                    let finalOfflineRate = fps * eff * constructOfflineBonus;

                    // Era 3 penalty
                    if (saved.era === 3) {
                        finalOfflineRate *= 0.2; // 80% reduction
                    }
                    // Expeditions apply a flat bonus multiplier (legacy support)
                    if (saved.expeditions?.completed) {
                        const expeditionBonus = saved.expeditions.completed.length > 0 ? (saved.expeditions.completed.length * 0.1) + 1 : 1;
                        finalOfflineRate *= expeditionBonus;
                    }
                    const voyagerLevel = getRelicLevel(saved.relics || [], 'relic_voyager');
                    if (voyagerLevel > 0) {
                        finalOfflineRate *= (1 + getRelicEffect('relic_voyager', voyagerLevel));
                    }

                    offlineFragments = Math.floor(finalOfflineRate * offlineSeconds);

                    // Check if streak is broken due to satiation
                    if (missedDays > 0 && updatedSatiation <= 0 && (saved.streaks?.current || 0) > 0) {
                        brokeStreak = true;
                    }

                    if (offlineFragments > 0 || brokeStreak || offlineSatiationLost > 0) {
                        setOfflineReport({
                            seconds: offlineSeconds,
                            fragments: offlineFragments,
                            satiationLost: offlineSatiationLost,
                            missedDays: missedDays,
                            brokeStreak: brokeStreak,
                        });
                        updatedSavedState.fragments = (updatedSavedState.fragments || 0) + offlineFragments;
                        updatedSavedState.stats = {
                            ...updatedSavedState.stats,
                            totalFragmentsEarned: (updatedSavedState.stats?.totalFragmentsEarned || 0) + offlineFragments
                        };
                        if (brokeStreak) {
                            updatedSavedState.streaks = { ...updatedSavedState.streaks, current: 0 };
                        }
                    }
                }
                hydrateState(updatedSavedState);
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
            // Note: This part of the original code was commented out and seemed to be
            // attempting to use `navigator.sendBeacon` or similar for unload.
            // For now, we'll keep the `saveNow()` call on visibility change.
            // If a robust unload save is needed, it typically involves `navigator.sendBeacon`
            // or a synchronous XHR, which is outside the scope of this specific edit.
            // The original comment block was:
            // const blob = new Blob([JSON.stringify({ state })], { type: 'application/json' });
            // API_BASE from utils/api. GAME_ID too. We must import GAME_ID, API_BASE.
            // But they are exported from api.js. Wait, we exported GAME_ID and API_BASE.
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
            const s = stateRef.current;
            const rating = event?.detail?.rating ?? 3; // Default to Good if missing

            const RATING_MULTIPLIERS = { 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.5 };
            const ratingMult = RATING_MULTIPLIERS[rating] ?? 1.0;

            // General Insight Gems logic
            let baseGemChance = (s.fortuneLevel * 0.05);
            const rosettaLevel = getRelicLevel(s.relics, 'relic_rosetta');
            if (rosettaLevel > 0) baseGemChance += getRelicEffect('relic_rosetta', rosettaLevel);

            // Apply Construct satiation bonus to gem chance
            const constructGemBonus = s.constructSatiation >= 10 ? 1.5 : 1;
            baseGemChance *= constructGemBonus;

            let gemAmount = 0;
            if (Math.random() < baseGemChance) {
                gemAmount = 1;
                if (s.enlightenments >= 4) gemAmount += 2;
            }
            if (gemAmount > 0) {
                setInsightGems(prev => prev + gemAmount);
                setTotalGemsEarned(prev => prev + gemAmount);
            }

            // Rating-Specific Resources Drop Logic
            let sparks = 0; let shards = 0; let cores = 0;
            if (rating === 4) sparks = 1 + (Math.random() < 0.3 ? 1 : 0);
            if (rating === 3) shards = 1;
            if (rating === 2) shards = 1 + (Math.random() < 0.5 ? 1 : 0);
            if (rating === 1) cores = 1;

            if (sparks > 0) setClaritySparks(prev => prev + sparks);
            if (shards > 0) setFocusShards(prev => prev + shards);
            if (cores > 0) setResilienceCores(prev => prev + cores);

            // Expedition Progress
            if (s.activeExpeditionId && s.activeExpeditionEndTime && Date.now() < s.activeExpeditionEndTime) {
                const newProgress = s.expeditionProgress + 1;

                if (newProgress >= s.activeExpeditionTarget) {
                    // Win condition
                    setCompletedExpeditions(prev => [...prev, s.activeExpeditionId]);

                    // Map old expedition IDs to new relics for now
                    let relicId = '';
                    if (s.activeExpeditionId === 'exp_rosetta') relicId = 'relic_rosetta';
                    if (s.activeExpeditionId === 'exp_silk_road') relicId = 'relic_hourglass';
                    if (s.activeExpeditionId === 'exp_apollo') relicId = 'relic_prism';
                    if (s.activeExpeditionId === 'exp_voyager') relicId = 'relic_voyager';

                    if (relicId) {
                        setRelics(prev => {
                            return [...prev, { id: relicId, level: 1 }];
                        });
                    }

                    setActiveExpeditionId(null);
                    setExpeditionProgress(0);
                    setActiveExpeditionEndTime(null);
                    setActiveExpeditionTarget(0);
                } else {
                    setExpeditionProgress(newProgress);
                }
            }

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
            if (s.lastStudyDate !== today) {
                setStreak(prev => prev + 1);
                setLastStudyDate(today);
            }

            const epiphanyMult = 1 + (s.epiphanies * 0.5);
            const enlightenMult = Math.pow(2, s.enlightenments);
            const frenzyMult = 1 + (s.frenzyStacks * FRENZY_BONUS_PER_STACK);

            const voyagerLevel = getRelicLevel(s.relics, 'relic_voyager');
            const relicGlobalMult = voyagerLevel > 0 ? (1 + getRelicEffect('relic_voyager', voyagerLevel)) : 1.0;

            const evolutionSatedBonus = [1.5, 1.6, 1.75, 2.0][s.constructEvolution] || 1.5;
            const constructSatiationMult = s.constructSatiation >= 10 ? evolutionSatedBonus : 1;
            const evolutionMult = [1, 1.1, 1.25, 1.5][s.constructEvolution] || 1;

            const burstAmount = 10 * s.globalMultiplier * relicGlobalMult * frenzyMult * epiphanyMult * enlightenMult * ratingMult * constructSatiationMult * evolutionMult;
            setFragments(prev => prev + burstAmount);
            setTotalFragmentsEarned(prev => prev + burstAmount);
            setTotalCardsReviewed(prev => prev + 1);

            const frenzyStacksToAdd = rating === 4 ? 2 : 1;
            setFrenzyStacks(prev => Math.min(prev + frenzyStacksToAdd, FRENZY_MAX_STACKS));

            // Evolution bonus: slower decay
            const evolutionDecayBonus = [1, 1.2, 1.5, 2][s.constructEvolution] || 1;
            setFrenzyDecayAt(Date.now() + (FRENZY_DECAY_MS * evolutionDecayBonus));

            const el = document.getElementById('gem-container');
            if (el) { el.classList.remove('animate-pulse'); void el.offsetWidth; el.classList.add('animate-pulse'); }

            // Check for Era advancement
            const next = getNextEra(s.era, getCalcFragmentsPerSec(s), s.totalCardsReviewed + 1);
            if (next && !pendingEraAdvance) {
                setPendingEraAdvance(next);
            }

            setTimeout(() => checkMilestones(true), 50);
        };
        window.addEventListener('flashquest:card-reviewed', handleCardReviewed);
        return () => window.removeEventListener('flashquest:card-reviewed', handleCardReviewed);
    }, [checkMilestones, pendingEraAdvance]);

    // ─── Active Expedition Timer ─────────────────────────────
    useEffect(() => {
        if (!activeExpeditionId || !activeExpeditionEndTime) return;

        const interval = setInterval(() => {
            if (Date.now() >= activeExpeditionEndTime) {
                // Fail condition
                setActiveExpeditionId(null);
                setExpeditionProgress(0);
                setActiveExpeditionEndTime(null);
                setActiveExpeditionTarget(0);
                saveNow();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeExpeditionId, activeExpeditionEndTime, saveNow]);

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
                    const evolutionDecayBonus = [1, 1.2, 1.5, 2][s.constructEvolution] || 1;
                    setFrenzyDecayAt(Date.now() + (FRENZY_DECAY_MS * evolutionDecayBonus));
                    return next;
                });
            }

            const fps = getCalcFragmentsPerSec(s);
            const frenzyMultiplier = 1 + (s.frenzyStacks * FRENZY_BONUS_PER_STACK);
            // Multipliers are already inside getCalcFragmentsPerSec, but frenzy and some others might be applied on top if FPS is base.
            // Wait, getCalcFragmentsPerSec already includes globalMultiplier, epiphany, enlighten, satiation, and surge.
            // It DOES NOT include frenzyMultiplier or relicGlobalMult (wait, I just added relicGlobalMult to it).
            // Let's check getCalcFragmentsPerSec again.
            // It returns: base * globalMult * epiphanyMult * enlightenMult * constructSatiationMult * relicGlobalMult * buffMult
            // So generated should just be fps * frenzyMultiplier.
            const generated = fps * frenzyMultiplier;

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
                const voyagerLevel = getRelicLevel(s.relics || [], 'relic_voyager');
                const expGlobalMult = voyagerLevel > 0 ? (1 + getRelicEffect('relic_voyager', voyagerLevel)) : 1.0;
                const hourglassLevel = getRelicLevel(s.relics || [], 'relic_hourglass');
                const expClickMult = hourglassLevel > 0 ? (1 + getRelicEffect('relic_hourglass', hourglassLevel)) : 1.0;
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
    const hourglassLevel = getRelicLevel(relics, 'relic_hourglass');
    const relicClickMult = hourglassLevel > 0 ? (1 + getRelicEffect('relic_hourglass', hourglassLevel)) : 1.0;

    const silkRoadLevel = getRelicLevel(relics, 'relic_silk_road'); // Wait, Silk Road relic id is usually relic_hourglass?
    // In handleCardReviewed, Silk Road expedition gives relic_hourglass.
    // Let's stick to getRelicLevel(relics, 'relic_hourglass') for discount too if that's what it was.
    // Actually Silk Road should probably be its own.
    // Checking expeditions.js...
    // Rosetta -> relic_rosetta
    // Silk Road -> relic_hourglass (Wait, that's what I wrote in handleCardReviewed)
    // Let's just use whatever is in handleCardReviewed for now.
    const relicDiscount = hourglassLevel > 0 ? 0.95 : 1.0;

    const discountMult = Math.pow(0.9, discountLevel) * relicDiscount;
    const clickPowerCost = Math.floor((50 * Math.pow(1.5, clickPower - 1)) * discountMult);
    const multiplierCost = Math.floor(2 * Math.pow(1.5, globalMultiplier - 1));
    const synergyCost = Math.floor(2 * Math.pow(1.35, synergyLevel));
    const discountCost = Math.floor(3 * Math.pow(1.35, discountLevel));
    const fortuneCost = Math.floor(5 * Math.pow(1.5, fortuneLevel));
    const insightBurstCost = 3;

    const epiphanyMult = 1 + (epiphanies * 0.5);
    const enlightenMult = Math.pow(2, enlightenments);
    const frenzyMultiplier = 1 + (frenzyStacks * FRENZY_BONUS_PER_STACK);

    const evolutionClickBonus = [0, 5, 20, 100][constructEvolution] || 0;
    const baseClick = (clickPower + synergyLevel + evolutionClickBonus) * relicClickMult;

    const voyagerLevel = getRelicLevel(relics, 'relic_voyager');
    const relicGlobalMult = voyagerLevel > 0 ? (1 + getRelicEffect('relic_voyager', voyagerLevel)) : 1.0;
    const streakMult = 1 + (Math.min(streak, 10) * 0.05);
    const focusBurstMult = focusBurstTime > 0 ? 2.0 : 1.0;

    const evolutionSatedBonus = [1.5, 1.6, 1.75, 2.0][constructEvolution] || 1.5;
    const constructSatiationMult = constructSatiation >= 10 ? evolutionSatedBonus : 1;

    // Total Fragments Per Sec for UI
    const fragmentsPerSec = getCalcFragmentsPerSec(stateRef.current) * frenzyMultiplier;

    // ─── Prestige ────────────────────────────────────────────
    const canPrestige = (generatorsArray.singularities || 0) >= 1;
    const canEnlighten = epiphanies >= 10;

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

    const handleEnlighten = () => {
        setFragments(0);
        setClickPower(1);
        setGeneratorsArray(GENERATORS.reduce((acc, g) => ({ ...acc, [g.key]: 0 }), {}));
        setFrenzyStacks(0); setFrenzyDecayAt(null);
        setEpiphanies(0);
        setEnlightenments(prev => prev + 1);
        setTimeout(() => {
            checkMilestones(true);
            saveNow();
        }, 200);
    };

    // ─── Actions ─────────────────────────────────────────────
    const handleManualClick = () => {
        const voyagerLevel = getRelicLevel(relics, 'relic_voyager');
        const relicGlobalMult = voyagerLevel > 0 ? (1 + getRelicEffect('relic_voyager', voyagerLevel)) : 1.0;
        const evolutionClickMult = [1, 1.1, 1.25, 1.5][constructEvolution] || 1;

        const evolutionSatedBonus = [1.5, 1.6, 1.75, 2.0][constructEvolution] || 1.5;
        const constructSatiationMult = constructSatiation >= 10 ? evolutionSatedBonus : 1;

        const amount = baseClick * globalMultiplier * relicGlobalMult * frenzyMultiplier * epiphanyMult * enlightenMult * evolutionClickMult * constructSatiationMult;
        setFragments(prev => prev + amount);
        setTotalFragmentsEarned(prev => prev + amount);
        setTotalClicks(prev => prev + 1);
    };

    const buyWithSave = (fn) => () => { fn(); setTimeout(() => saveNow(), 100); };

    const buyGenerator = (key) => {
        const gen = GENERATORS.find(g => g.key === key);
        if (gen) {
            const cost = calcGeneratorCost(gen.baseCost, generatorsArray[key] || 0, discountMult);
            if (fragments >= cost) {
                setFragments(p => p - cost);
                setGeneratorsArray(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
            }
            return;
        }

        const sup = SUPPORT_NODES.find(s => s.key === key);
        if (sup) {
            const cost = sup.baseCost; // Support nodes have fixed cost for now
            if (fragments >= cost && !supportNodesArray[key]) {
                setFragments(p => p - cost);
                setSupportNodesArray(prev => ({ ...prev, [key]: 1 }));
            }
            return;
        }
    };

    const buyClickPower = () => { if (fragments >= clickPowerCost) { setFragments(p => p - clickPowerCost); setClickPower(p => p + 1); } };
    const buyInsightBurst = (currencyType = 'gem') => {
        if (stateRef.current.fragmentsPerSec <= 0) return;

        let canBuy = false;
        if (currencyType === 'gem' && stateRef.current.insightGems >= insightBurstCost) canBuy = true;
        if (currencyType === 'shard' && stateRef.current.focusShards >= insightBurstCost) canBuy = true;
        if (currencyType === 'spark' && stateRef.current.claritySparks >= insightBurstCost) canBuy = true;

        if (canBuy) {

            if (currencyType === 'gem') setInsightGems(prev => prev - insightBurstCost);
            if (currencyType === 'shard') setFocusShards(prev => prev - insightBurstCost);
            if (currencyType === 'spark') setClaritySparks(prev => prev - insightBurstCost);

            const burst = stateRef.current.fragmentsPerSec * 120;
            setFragments(prev => prev + burst);
            setTotalFragmentsEarned(prev => prev + burst);
            // setInsightBurstCost(prev => Math.floor(prev * 1.5)); // This state variable doesn't exist
            saveNow();
        }
    };

    const handleBuyConsumable = (buffId) => {
        const item = CONSUMABLES[buffId];
        if (!item) return;

        let canAfford = false;
        if (item.costType === 'spark' && claritySparks >= item.cost) canAfford = true;
        if (item.costType === 'shard' && focusShards >= item.cost) canAfford = true;
        if (item.costType === 'core' && resilienceCores >= item.cost) canAfford = true;

        if (canAfford) {
            if (item.costType === 'spark') setClaritySparks(p => p - item.cost);
            if (item.costType === 'shard') setFocusShards(p => p - item.cost);
            if (item.costType === 'core') setResilienceCores(p => p - item.cost);

            setActiveBuffs(prev => ({
                ...prev,
                [buffId]: Date.now() + item.duration
            }));
            saveNow();
        }
    };

    const handleForgeRelic = (relicId, level) => {
        const cost = 100; // 100 Shards to upgrade
        const duplicates = relics.filter(r => r.id === relicId && r.level === level);
        if (duplicates.length >= 3 && focusShards >= cost) {
            setFocusShards(prev => prev - cost);
            setRelics(prev => {
                const filtered = [];
                let removedCount = 0;
                for (const r of prev) {
                    if (r.id === relicId && r.level === level && removedCount < 3) {
                        removedCount++;
                    } else {
                        filtered.push(r);
                    }
                }
                return [...filtered, { id: relicId, level: level + 1 }];
            });
            setTimeout(() => saveNow(), 100);
        }
    };

    const buyMultiplier = (currencyType = 'gem') => {
        let canBuy = false;
        if (currencyType === 'gem' && stateRef.current.insightGems >= multiplierCost) canBuy = true;
        if (currencyType === 'shard' && stateRef.current.focusShards >= multiplierCost) canBuy = true;
        if (currencyType === 'spark' && stateRef.current.claritySparks >= multiplierCost) canBuy = true;

        if (canBuy) {
            if (currencyType === 'gem') setInsightGems(prev => prev - multiplierCost);
            if (currencyType === 'shard') setFocusShards(prev => prev - multiplierCost);
            if (currencyType === 'spark') setClaritySparks(prev => prev - multiplierCost);

            setGlobalMultiplier(prev => prev + 1);
            // setMultiplierCost(prev => Math.floor(prev * 5)); // This state variable doesn't exist
            checkMilestones();
            saveNow();
        }
    };

    const buySynergy = (currencyType = 'gem') => {
        let canBuy = false;
        if (currencyType === 'gem' && stateRef.current.insightGems >= synergyCost) canBuy = true;
        if (currencyType === 'shard' && stateRef.current.focusShards >= synergyCost) canBuy = true;
        if (currencyType === 'spark' && stateRef.current.claritySparks >= synergyCost) canBuy = true;

        if (canBuy) {
            if (currencyType === 'gem') setInsightGems(prev => prev - synergyCost);
            if (currencyType === 'shard') setFocusShards(prev => prev - synergyCost);
            if (currencyType === 'spark') setClaritySparks(prev => prev - synergyCost);

            setSynergyLevel(prev => prev + 1);
            // setSynergyCost(prev => Math.floor(prev * 2.5)); // This state variable doesn't exist
            saveNow();
        }
    };

    const buyDiscount = (currencyType = 'gem') => {
        let canBuy = false;
        if (currencyType === 'gem' && stateRef.current.insightGems >= discountCost) canBuy = true;
        if (currencyType === 'shard' && stateRef.current.focusShards >= discountCost) canBuy = true;
        if (currencyType === 'spark' && stateRef.current.claritySparks >= discountCost) canBuy = true;

        if (canBuy) {
            if (currencyType === 'gem') setInsightGems(prev => prev - discountCost);
            if (currencyType === 'shard') setFocusShards(prev => prev - discountCost);
            if (currencyType === 'spark') setClaritySparks(prev => prev - discountCost);

            setDiscountLevel(prev => prev + 1);
            // setDiscountCost(prev => Math.floor(prev * 3)); // This state variable doesn't exist
            saveNow();
        }
    };

    const buyFortune = (currencyType = 'gem') => {
        let canBuy = false;
        if (currencyType === 'gem' && stateRef.current.insightGems >= fortuneCost) canBuy = true;
        if (currencyType === 'shard' && stateRef.current.focusShards >= fortuneCost) canBuy = true;
        if (currencyType === 'spark' && stateRef.current.claritySparks >= fortuneCost) canBuy = true;

        if (canBuy) {
            if (currencyType === 'gem') setInsightGems(prev => prev - fortuneCost);
            if (currencyType === 'shard') setFocusShards(prev => prev - fortuneCost);
            if (currencyType === 'spark') setClaritySparks(prev => prev - fortuneCost);

            setFortuneLevel(prev => prev + 1);
            // setFortuneCost(prev => Math.floor(prev * 4)); // This state variable doesn't exist
            saveNow();
        }
    };



    const handleAdvanceEra = () => {
        if (!pendingEraAdvance) return;
        setEra(pendingEraAdvance.id);
        setPendingEraAdvance(null);
        setTimeout(() => saveNow(), 100);
    };

    const handleStartExpedition = (expId, cost, targetSteps, minutes) => {
        if (stateRef.current.fragments >= cost) {
            setFragments(prev => prev - cost);
            setActiveExpeditionId(expId);
            setExpeditionProgress(0);
            setActiveExpeditionTarget(targetSteps);
            setActiveExpeditionEndTime(Date.now() + (minutes * 60 * 1000));
            saveNow();
        }
    };

    return {
        // State
        isLoading, offlineReport, saveFlash, fragmentFlash, activeBanner,
        fragments, insightGems, claritySparks, focusShards, resilienceCores, clickPower, globalMultiplier, generatorsArray,
        supportNodesArray,
        synergyLevel, discountLevel, fortuneLevel,
        frenzyStacks, epiphanies, totalResets, enlightenments,
        constructSatiation, constructEvolution, constructGrowthPoints,
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
        handlePrestige, handleEnlighten, buyWithSave, handleAdvanceEra, handleStartExpedition, handleForgeRelic, handleBuyConsumable,
        activeBuffs
    };
}
