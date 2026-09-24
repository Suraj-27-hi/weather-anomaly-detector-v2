import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Weather card skeleton */}
      <div className="glass-card p-6 border border-cyan-500/20">
        <div className="flex justify-between items-center mb-4">
          <div className="w-28 h-4 skeleton-box rounded" />
          <div className="w-20 h-4 skeleton-box rounded" />
        </div>
        <div className="flex justify-between items-center my-4">
          <div>
            <div className="w-36 h-12 skeleton-box rounded mb-2" />
            <div className="w-24 h-4 skeleton-box rounded" />
          </div>
          <div className="w-24 h-24 skeleton-box rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="h-14 skeleton-box rounded" />
          <div className="h-14 skeleton-box rounded" />
          <div className="h-14 skeleton-box rounded" />
        </div>
      </div>

      {/* Anomaly card skeleton */}
      <div className="glass-card p-5 border border-cyan-500/20">
        <div className="w-40 h-4 skeleton-box rounded mb-3" />
        <div className="w-64 h-8 skeleton-box rounded mb-2" />
        <div className="w-full h-16 skeleton-box rounded" />
      </div>

      {/* Graph skeleton */}
      <div className="glass-card p-5 border border-cyan-500/20">
        <div className="w-48 h-5 skeleton-box rounded mb-4" />
        <div className="w-full h-48 skeleton-box rounded" />
      </div>
    </div>
  );
}
