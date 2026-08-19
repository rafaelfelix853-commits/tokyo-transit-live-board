"use client";

import { useEffect, useState } from "react";

interface TransitAlert {
  id: number;
  line_name: string;
  operator: string;
  status: string;
  delay_minutes: number;
  cause: string | null;
  updated_at: string;
  is_official?: boolean; // Flag to differentiate official feed vs community report
}

export default function Home() {
  const [alerts, setAlerts] = useState<TransitAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedStation, setSelectedStation] = useState<string>("All");
  const [selectedOperator, setSelectedOperator] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    line_name: "Yamanote Line",
    operator: "JR East",
    status: "Delay",
    delay_minutes: 0,
    cause: "",
    is_official: false, // Default: Community Report
  });

  // Fetch transit status from Backend API
  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/alerts/");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error("Failed to fetch transit alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling every 10 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Submit new user/community report
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/alerts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          line_name: "Yamanote Line",
          operator: "JR East",
          status: "Normal",
          delay_minutes: 0,
          cause: "",
          is_official: false,
        });
        fetchAlerts();
      }
    } catch (err) {
      console.error("Failed to create incident report:", err);
    }
  };

  // Delete/Resolve community reports only
  const handleDeleteAlert = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/alerts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error("Failed to delete incident report:", err);
    }
  };

  // Status Badge Component
  const getStatusBadge = (status: string, delay: number) => {
    const s = status.toLowerCase();
    if (s.includes("suspend")) {
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          🔴 Service Suspended
        </span>
      );
    }
    if (s.includes("delay") || delay > 0) {
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          🟡 Delayed ({delay} min)
        </span>
      );
    }
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        🟢 On Time
      </span>
    );
  };

  // Filter alerts by station & operator
  const filteredAlerts = alerts.filter((alert) => {
    const matchesOperator =
      selectedOperator === "All" || alert.operator === selectedOperator;
    const matchesStation =
      selectedStation === "All" ||
      (alert.cause && alert.cause.toLowerCase().includes(selectedStation.toLowerCase())) ||
      alert.line_name.toLowerCase().includes(selectedStation.toLowerCase());
    return matchesOperator && matchesStation;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <header className="mb-8 border-b border-slate-700 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              🚃 Japan Transit Live Board
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Real-time railway operations and community status monitor
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-lg text-sm transition shadow-lg"
            >
              + Report Incident
            </button>
            <button
              onClick={() => {
                setLoading(true);
                fetchAlerts();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold rounded-lg text-sm transition"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* STATION & OPERATOR FILTERS */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                📍 Target Station:
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Stations</option>
                <option value="Shinjuku">Shinjuku (新宿)</option>
                <option value="Shibuya">Shibuya (渋谷)</option>
                <option value="Tokyo">Tokyo (東京)</option>
                <option value="Ueno">Ueno (上野)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                🏢 Railway Operator:
              </label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Operators</option>
                <option value="JR East">JR East</option>
                <option value="Tokyo Metro">Tokyo Metro</option>
                <option value="Toei Subway">Toei Subway</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredAlerts.length}</strong> of{" "}
            <strong className="text-slate-200">{alerts.length}</strong> active alerts
          </div>
        </div>

        {/* ALERTS GRID */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Fetching live status feed...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-700/60">
            <p className="text-slate-400 text-lg">No transit alerts or delays found for selected filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl p-5 shadow-xl transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-700 text-slate-300 rounded-md">
                          {alert.operator}
                        </span>
                        {alert.is_official ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                            Official Feed
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                            Community Report
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {alert.line_name}
                      </h2>
                    </div>
                    {getStatusBadge(alert.status, alert.delay_minutes)}
                  </div>

                  {alert.cause && (
                    <div className="mt-3 bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 text-sm">
                      <strong className="text-slate-400">Details:</strong>{" "}
                      <span className="text-slate-200">{alert.cause}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Updated at: {new Date(alert.updated_at).toLocaleTimeString()}
                  </span>

                  {/* Resolve button renders ONLY for community reports */}
                  {!alert.is_official ? (
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded transition border border-transparent hover:border-red-500/20"
                    >
                      Resolve Report
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Managed by Operator
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL FOR COMMUNITY INCIDENT REPORTING */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Submit Community Report</h2>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Line Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.line_name}
                    onChange={(e) => setFormData({ ...formData, line_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Yamanote Line, Chuo Line, Ginza Line"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Operator
                    </label>
                    <select
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="JR East">JR East</option>
                      <option value="Tokyo Metro">Tokyo Metro</option>
                      <option value="Toei Subway">Toei Subway</option>
                      <option value="Keio">Keio</option>
                      <option value="Odakyu">Odakyu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Delay">Delay</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Delay (in Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delay_minutes}
                    onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Station & Incident Details
                  </label>
                  <textarea
                    rows={2}
                    value={formData.cause}
                    onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Signal trouble near Shinjuku Station (Platform 2)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}