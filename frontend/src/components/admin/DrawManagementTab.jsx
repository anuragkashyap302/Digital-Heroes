import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DrawBall } from '../draw/DrawBall';
import { WinnerTiersBreakdown } from '../draw/WinnerTiersBreakdown';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { 
  Trophy, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  RotateCw, 
  Sliders, 
  Eye, 
  Send,
  Plus,
  HelpCircle
} from 'lucide-react';

export const DrawManagementTab = () => {
  const notify = useNotification();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [drawMode, setDrawMode] = useState('random_lottery');
  const [simulationData, setSimulationData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/draws');
      setDraws(res.draws || []);
      if (res.draws?.length > 0) {
        const activeOrDraft = res.draws.find(d => d.status === 'draft' || d.status === 'simulated') || res.draws[0];
        setSelectedDraw(activeOrDraft);
        setDrawMode(activeOrDraft.mode || 'random_lottery');
      }
    } catch (err) {
      notify.error('Failed to load draws list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, []);

  const handleSimulate = async () => {
    if (!selectedDraw) return;
    setSimulating(true);
    setSimulationData(null);
    try {
      const res = await api.post(`/admin/draws/${selectedDraw.id}/simulate`, {
        mode: drawMode
      });
      setSimulationData(res.simulation);
      notify.success('Draw simulation completed. Review results below before publishing.');
    } catch (err) {
      notify.error(err.message || 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!simulationData) {
      notify.error('Please run a simulation before publishing.');
      return;
    }

    if (!window.confirm('Are you sure you want to PUBLISH this draw? This will create immutable snapshot entries and notify winners.')) return;

    setPublishing(true);
    try {
      await api.post(`/admin/draws/${selectedDraw.id}/publish`, {
        mode: simulationData.mode,
        winningNumbers: simulationData.winningNumbers,
        pools: simulationData.pools,
        nextRollover: simulationData.nextRollover,
        winners: simulationData.winners,
        eligibleEntries: simulationData.sampleEntries
      });

      notify.success('Draw published successfully! Winner records and immutable snapshots created.');
      setSimulationData(null);
      await fetchDraws();
    } catch (err) {
      notify.error(err.message || 'Failed to publish draw.');
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      const res = await api.post('/admin/draws', {
        name: `Digital Heroes Impact Draw #${draws.length + 101}`,
        mode: 'random_lottery',
        prize_pool_total: 18000.00
      });
      notify.success('New draft draw created.');
      await fetchDraws();
    } catch (err) {
      notify.error(err.message || 'Failed to create draft draw.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            Draw Engine & Simulation Studio
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Configure draw parameters, execute non-publishing simulations, review prize distribution, and publish official results.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleCreateDraft} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Create Draft Draw</span>
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading draw control center..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Col: Draw Selector & Strategy Configuration */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Draw Selector Card */}
            <Card className="p-6 space-y-4">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                1. Select Target Draw
              </label>
              <select
                value={selectedDraw?.id || ''}
                onChange={(e) => {
                  const target = draws.find(d => d.id === e.target.value);
                  setSelectedDraw(target);
                  setSimulationData(null);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-pine"
              >
                {draws.map((d) => (
                  <option key={d.id} value={d.id}>
                    #{d.draw_number} — {d.name} ({d.status.toUpperCase()})
                  </option>
                ))}
              </select>

              {selectedDraw && (
                <div className="p-4 rounded-2xl bg-canvas/70 border border-sage/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Status:</span>
                    <Badge variant={selectedDraw.status === 'published' ? 'success' : 'gold'} size="sm">
                      {selectedDraw.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Scheduled Date:</span>
                    <span className="font-semibold text-ink">{new Date(selectedDraw.draw_date).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Mode Strategy Card */}
            <Card className="p-6 space-y-4">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                2. Select Draw Strategy Mode
              </label>

              <div className="space-y-3">
                <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  drawMode === 'random_lottery' ? 'border-pine bg-pine/5 ring-2 ring-pine/30' : 'border-sage/40 bg-canvas/30'
                }`}>
                  <input
                    type="radio"
                    name="drawMode"
                    value="random_lottery"
                    checked={drawMode === 'random_lottery'}
                    onChange={() => setDrawMode('random_lottery')}
                    className="mt-1 text-pine focus:ring-pine"
                  />
                  <div>
                    <strong className="font-serif text-sm font-bold text-ink block">Random Lottery Mode</strong>
                    <span className="text-[11px] text-ink-muted leading-relaxed block mt-0.5">
                      Uses Node.js cryptographic randomness to draw 5 uniform numbers (1–45).
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  drawMode === 'algorithmic_frequency' ? 'border-pine bg-pine/5 ring-2 ring-pine/30' : 'border-sage/40 bg-canvas/30'
                }`}>
                  <input
                    type="radio"
                    name="drawMode"
                    value="algorithmic_frequency"
                    checked={drawMode === 'algorithmic_frequency'}
                    onChange={() => setDrawMode('algorithmic_frequency')}
                    className="mt-1 text-pine focus:ring-pine"
                  />
                  <div>
                    <strong className="font-serif text-sm font-bold text-ink block">Algorithmic Weighted Mode</strong>
                    <span className="text-[11px] text-ink-muted leading-relaxed block mt-0.5">
                      Computes weighted frequency distribution across all active subscribers' recorded scores.
                    </span>
                  </div>
                </label>
              </div>

              {/* Simulation Action Trigger */}
              <Button
                variant="primary"
                size="lg"
                loading={simulating}
                onClick={handleSimulate}
                className="w-full justify-center gap-2 mt-4 shadow-soft"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Simulation (No Publish)</span>
              </Button>
            </Card>

          </div>

          {/* Right Col: Simulation Stage & Review */}
          <div className="lg:col-span-8 space-y-6">
            
            {!simulationData ? (
              <Card className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-canvas flex items-center justify-center text-pine mx-auto">
                  <Sliders className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-ink">
                  Simulation Ready
                </h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  Select a draw, choose between <strong>Random Lottery</strong> or <strong>Algorithmic Weighted</strong> mode, and click "Run Simulation" to preview winning numbers, eligible subscribers, and prize pool splits before committing.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                
                {/* Simulation Result Header */}
                <Card className="p-8 space-y-6 border-2 border-pine/40 shadow-soft-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-light">
                    <div>
                      <div className="flex items-center gap-3">
                        <Badge variant="gold" size="sm">Simulation Verified</Badge>
                        <span className="text-xs font-semibold text-pine-dark capitalize">
                          {simulationData.mode.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-ink mt-1">
                        Simulated Winning Combination
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulate}
                        loading={simulating}
                        className="gap-1 text-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Re-simulate</span>
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={handlePublish}
                        loading={publishing}
                        className="gap-1 text-xs shadow-gold-glow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Commit & Publish Draw</span>
                      </Button>
                    </div>
                  </div>

                  {/* 5 Balls */}
                  <div className="bg-canvas/80 p-6 rounded-3xl border border-sage/30 flex items-center justify-center gap-3 sm:gap-4">
                    {simulationData.winningNumbers.map((n, i) => (
                      <DrawBall key={i} number={n} matched={true} size="lg" animated={true} delay={i * 0.1} />
                    ))}
                  </div>

                  {/* Winners Summary Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-white p-4 rounded-2xl border border-sage/30">
                      <span className="text-[10px] uppercase font-bold text-ink-muted block">Eligible Players</span>
                      <span className="font-serif text-2xl font-bold text-ink">{simulationData.eligibleCount}</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-sage/30">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Tier 1 (5-Match)</span>
                      <span className="font-serif text-2xl font-bold text-amber-900">{simulationData.winnersSummary.tier5Count}</span>
                      <span className="text-[10px] text-ink-muted">({simulationData.winnersSummary.tier5Count === 0 ? 'Rolls Over' : 'Won!'})</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-sage/30">
                      <span className="text-[10px] uppercase font-bold text-pine block">Tier 2 (4-Match)</span>
                      <span className="font-serif text-2xl font-bold text-pine-dark">{simulationData.winnersSummary.tier4Count}</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-sage/30">
                      <span className="text-[10px] uppercase font-bold text-ink-muted block">Tier 3 (3-Match)</span>
                      <span className="font-serif text-2xl font-bold text-ink">{simulationData.winnersSummary.tier3Count}</span>
                    </div>
                  </div>
                </Card>

                {/* Prize Pools Breakdown */}
                <WinnerTiersBreakdown
                  pool5Match={simulationData.pools.pool5Match}
                  pool4Match={simulationData.pools.pool4Match}
                  pool3Match={simulationData.pools.pool3Match}
                  rolloverAmount={simulationData.pools.previousRollover}
                  tier5WinnersCount={simulationData.winnersSummary.tier5Count}
                  tier4WinnersCount={simulationData.winnersSummary.tier4Count}
                  tier3WinnersCount={simulationData.winnersSummary.tier3Count}
                />

                {/* Winner Preview List */}
                {simulationData.winners.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h4 className="font-serif text-xl font-bold text-ink">
                      Simulated Winners Preview ({simulationData.winners.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-canvas text-ink-muted font-semibold uppercase">
                          <tr>
                            <th className="py-3 px-4">Subscriber</th>
                            <th className="py-3 px-4">Tier</th>
                            <th className="py-3 px-4">Matches</th>
                            <th className="py-3 px-4 text-right">Prize Split</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sage-light">
                          {simulationData.winners.map((w, idx) => (
                            <tr key={idx}>
                              <td className="py-3 px-4 font-semibold text-ink">{w.fullName} ({w.email})</td>
                              <td className="py-3 px-4"><Badge variant="tier5" size="sm">{w.tierWon}</Badge></td>
                              <td className="py-3 px-4">{w.matchedCount} numbers [{w.matchedNumbers.join(', ')}]</td>
                              <td className="py-3 px-4 text-right font-serif font-bold text-emerald-800">£{w.prizeAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
