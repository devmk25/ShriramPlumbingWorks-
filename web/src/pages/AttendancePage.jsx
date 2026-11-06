import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, Save, Calendar, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AttendancePage = () => {
  const { data, saveBulkAttendance, t } = useApp();
  const { workers, sites, attendance } = data;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState('');

  // Local state for all workers' attendance on the selected date
  const [attendanceState, setAttendanceState] = useState(() => {
    return workers.reduce((acc, worker) => {
      // Check if already marked for today
      const existing = attendance.find(a => a.workerId === worker.id && a.date === new Date().toISOString().split('T')[0]);
      acc[worker.id] = {
        status: existing ? existing.status : 'FULL', // Default to FULL for fast 1-tap operation
        siteId: existing ? existing.siteId : (sites[0]?.id || '')
      };
      return acc;
    }, {});
  });

  const handleStatusChange = (workerId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status
      }
    }));
  };

  const handleSiteChange = (workerId, siteId) => {
    setAttendanceState(prev => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        siteId
      }
    }));
  };

  const handleSaveAll = () => {
    const payload = Object.keys(attendanceState).map(workerId => ({
      workerId,
      siteId: attendanceState[workerId].siteId,
      date: selectedDate,
      status: attendanceState[workerId].status
    }));

    saveBulkAttendance(payload);
    setSuccessMessage(t.attendanceSavedSuccess);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Quick tally
  const fullCount = Object.values(attendanceState).filter(s => s.status === 'FULL').length;
  const halfCount = Object.values(attendanceState).filter(s => s.status === 'HALF').length;
  const absentCount = Object.values(attendanceState).filter(s => s.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>⏱️</span> {t.attendanceTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.attendanceSubtitle}
          </p>
        </div>

        {/* Date Selector & Save Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 tactile-well">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-hidden font-bold text-slate-800 cursor-pointer"
            />
          </div>

          <button
            onClick={handleSaveAll}
            className="tactile-btn-emerald px-5 py-2.5 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 ml-auto md:ml-0"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveAllAttendance}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Real-time Summary Pills - Bento Grid Metrics */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-2.5 rounded-xl bento-card text-xs font-bold text-slate-700 flex items-center gap-2">
          <span>एकूण कामगार:</span>
          <span className="text-blue-600 font-black">{workers.length}</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bento-card border-emerald-200 bg-emerald-50/50 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <span>Full Day (१.०):</span>
          <span className="text-emerald-700 font-black">{fullCount}</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bento-card border-blue-200 bg-blue-50/50 text-xs font-bold text-blue-800 flex items-center gap-2">
          <span>Half Day (०.५):</span>
          <span className="text-blue-700 font-black">{halfCount}</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bento-card border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2">
          <span>गैरहजर (०):</span>
          <span className="text-slate-800 font-black">{absentCount}</span>
        </div>
      </div>

      {/* Worker Attendance Matrix - Bento Card */}
      <div className="bento-card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {workers.map((worker) => {
            const currentRec = attendanceState[worker.id] || { status: 'FULL', siteId: sites[0]?.id || '' };
            const status = currentRec.status;

            return (
              <div
                key={worker.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Worker Identity */}
                <div className="space-y-1 min-w-[220px]">
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span>{worker.fullName}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {worker.skill}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    रोजंदारी दर: <span className="font-bold text-slate-700">₹{worker.dailyRate} / दिवस</span>
                  </div>
                </div>

                {/* Site Selection Tag */}
                <div className="w-full sm:w-auto">
                  <select
                    value={currentRec.siteId}
                    onChange={(e) => handleSiteChange(worker.id, e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden cursor-pointer tactile-well"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        📍 {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 30-Second Fast Tapping Buttons - 3D Tactile Switches */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  {/* Full Day */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(worker.id, 'FULL')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'FULL'
                        ? 'tactile-btn-emerald shadow-md'
                        : 'tactile-btn text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Full (१.०)</span>
                  </button>

                  {/* Half Day */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(worker.id, 'HALF')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'HALF'
                        ? 'tactile-btn-primary shadow-md'
                        : 'tactile-btn text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Half (०.५)</span>
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(worker.id, 'ABSENT')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'ABSENT'
                        ? 'bg-slate-800 text-white shadow-md border border-slate-900 tactile-pressed'
                        : 'tactile-btn text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>रजा (०)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
