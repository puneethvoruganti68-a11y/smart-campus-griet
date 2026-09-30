"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getGreeting } from '@/lib/constants';
import IssueCard from '@/components/issues/IssueCard';
import NotificationCard from '@/components/issues/NotificationCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Bell, AlertTriangle, CheckCircle, Clock, FileText, Activity } from 'lucide-react';
import { Issue, Notification } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState({ open: 0, in_progress: 0, resolved: 0, high_priority: 0 });

  useEffect(() => {
    if (!user) return;
    fetch('/api/student/summary').then(response => response.ok ? response.json() : null).then(data => {
      if (!data) return;
      setIssues(data.issues || []);
      setCounts({
        open: Number(data.counts?.open || 0),
        in_progress: Number(data.counts?.in_progress || 0),
        resolved: Number(data.counts?.resolved || 0),
        high_priority: Number(data.counts?.high_priority || 0),
      });
    }).catch(() => undefined);
    fetch('/api/student/notifications').then(response => response.ok ? response.json() : null).then(data => {
      if (!data) return;
      setNotifications((data.notifications || []).map((notification: Record<string, unknown>) => ({
        id: notification.id,
        userId: user.id,
        issueId: notification.issue_id,
        ticketNumber: notification.ticket_number,
        message: notification.message,
        type: 'info',
        isRead: Boolean(notification.is_read),
        createdAt: notification.created_at,
      } as Notification)));
    }).catch(() => undefined);
  }, [user]);

  if (!user) return null;

  const openIssues = counts.open;
  const inProgressIssues = counts.in_progress;
  const resolvedIssues = counts.resolved;
  const highPriority = counts.high_priority;

  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentNotifs = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const pieData = [
    { name: 'Reported / Open', value: openIssues, color: '#f59e0b' },
    { name: 'In Progress', value: inProgressIssues, color: '#2563eb' },
    { name: 'Resolved', value: resolvedIssues, color: '#16a34a' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 px-4 sm:px-6 lg:px-8 pt-6 md:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {user.name}!</h1>
          <p className="text-slate-500">{user.classSection} · Roll Number {user.rollNumber}</p>
        </div>
        <Link href="/student/report">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Open</p>
                <h3 className="text-2xl font-bold text-slate-900">{openIssues}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">In Progress</p>
                <h3 className="text-2xl font-bold text-slate-900">{inProgressIssues}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Resolved</p>
                <h3 className="text-2xl font-bold text-slate-900">{resolvedIssues}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Activity className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">High Priority</p>
                <h3 className="text-2xl font-bold text-slate-900">{highPriority}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Recent Reports</CardTitle>
              <Link href="/student/issues" className="text-sm text-blue-600 hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {recentIssues.length > 0 ? (
                <div className="space-y-4">
                  {recentIssues.map(issue => (
                    <IssueCard key={issue.id} issue={issue} showDetailsAction href={`/student/issues/${issue.id}`} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No reports yet"
                  description="Your submitted campus issues will appear here."
                  action={<Link href="/student/report"><Button><Plus className="w-4 h-4 mr-2" />Report an Issue</Button></Link>}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Status</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4 text-sm">
                    {pieData.map((entry, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">No data to display</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Notifications</CardTitle>
              <Link href="/student/notifications" className="text-sm text-blue-600 hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {recentNotifs.length > 0 ? (
                <div className="space-y-4">
                  {recentNotifs.map(notif => (
                    <NotificationCard 
                      key={notif.id} 
                      notification={notif} 
                      onRead={(id) => {
                        fetch('/api/student/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                        setNotifications(current => current.map(item => item.id === id ? { ...item, isRead: true } : item));
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm flex flex-col items-center">
                  <Bell className="w-8 h-8 text-slate-300 mb-2" />
                  <p>No new notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
