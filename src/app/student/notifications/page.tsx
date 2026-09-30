"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Notification } from '@/lib/types';
import NotificationCard from '@/components/issues/NotificationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) fetch('/api/student/notifications').then(response => response.ok ? response.json() : { notifications: [] }).then(data => {
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
    }).catch(() => setNotifications([]));
  }, [user]);

  if (!user) return null;

  const handleRead = (id: string) => {
    fetch('/api/student/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    window.dispatchEvent(new Event('campus-notifications-updated'));
    setNotifications(current => current.map(item => item.id === id ? { ...item, isRead: true } : item));
  };

  const handleMarkAllRead = () => {
    fetch('/api/student/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    window.dispatchEvent(new Event('campus-notifications-updated'));
    setNotifications(current => current.map(item => ({ ...item, isRead: true })));
  };

  const handleNotificationClick = (issueId: string) => {
    if (issueId) {
      router.push(`/student/issues/${issueId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated on your reported issues.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onRead={handleRead}
              onClick={handleNotificationClick}
            />
          ))
        ) : (
          <div className="py-12 bg-white rounded-xl shadow-sm border border-slate-100">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When there are updates to your issues, they will appear here."
            />
          </div>
        )}
      </div>
    </div>
  );
}
