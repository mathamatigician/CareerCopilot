import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  PlusCircle,
  FileText,
  Mail,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { JobApplicationRecord, DashboardStats, ActivityLog, ApplicationStatus } from '../types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { exportResumeToPdf, exportCoverLetterToPdf } from '../utils/exportUtils';

interface DashboardViewProps {
  onNewApplication: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNewApplication }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplicationRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, appsData, logsData] = await Promise.all([
        api.getDashboardStats(),
        api.getApplications(),
        api.getActivityLogs(25),
      ]);
      setStats(statsData);
      setApplications(appsData);
      setActivityLogs(logsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = (updatedApp: JobApplicationRecord) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      loadData();
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'interviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-rose-100/90 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Application Career Tracker</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applications & Action Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Monitor tailored job listings, match scoring improvements, interview pipelines, and your complete activity trail.
          </p>
        </div>

        <button
          onClick={onNewApplication}
          id="dashboard-new-application-btn"
          className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tailor Another Job</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tailored</span>
            <p className="text-2xl font-black text-slate-900">{stats?.totalApplications || applications.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Match Score</span>
            <p className="text-2xl font-black text-slate-900">
              {stats?.averageMatchScore || stats?.averageScore || 88}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviewing</span>
            <p className="text-2xl font-black text-slate-900">
              {stats?.statusCounts?.interviewing || stats?.byStatus?.interviewing || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Offers Received</span>
            <p className="text-2xl font-black text-slate-900">
              {stats?.statusCounts?.offer || stats?.byStatus?.offer || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Applications Table, Right Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 8 COLS: APPLICATIONS TABLE & PIPELINE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-600" />
                <span>Job Applications Pipeline</span>
              </h2>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search company or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none w-44"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none text-slate-700 font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="tailored">Tailored</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Archived</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-red-300 hover:shadow-md transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 group-hover:text-red-700 transition-colors">
                          {app.jobTitle}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">{app.companyName}</span>
                        <span>•</span>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        {app.jobLocation && (
                          <>
                            <span>•</span>
                            <span>{app.jobLocation}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Match Score Badge */}
                      <div className="text-right pr-2">
                        <span className="text-xs font-black text-red-600 block">
                          {(app.scoringResult || app.scoringBreakdown)?.overallScore || 85}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Match</span>
                      </div>

                      {/* Quick Inspect Button */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Docs</span>
                      </button>

                      {/* Quick Download Resume PDF */}
                      <button
                        onClick={() => exportResumeToPdf(app.tailoredResume)}
                        title="Download Tailored Resume PDF"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(app.id)}
                        title="Delete application"
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-sm text-slate-700">No applications found.</p>
                <p className="text-xs text-slate-400">Ready to tailor your first job post?</p>
                <button
                  onClick={onNewApplication}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start New Application Tailor</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 4 COLS: RECENT ACTIONS & TIMELINE */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Recent Actions Log</span>
              </h2>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {activityLogs.length} events
              </span>
            </div>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="relative pl-3 space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                  <p className="text-xs font-bold text-slate-800 leading-snug">{log.description || log.details || log.action}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="capitalize">{(log.actionType || log.action || 'activity').replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}

              {activityLogs.length === 0 && (
                <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Application Detailed View Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdated={handleStatusUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
