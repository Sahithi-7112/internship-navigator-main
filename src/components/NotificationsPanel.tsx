import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API_BASE_URL from "@/lib/api";

interface NotificationItem {
  _id: string;
  message: string;
  target?: string;
  isRead: boolean;
  type: string;
  createdAt: string;
  internshipId?: {
    _id: string;
    role?: string;
    company?: string;
    lastDateToApply?: string;
    deadlineNote?: string;
  };
}

export default function NotificationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user || user.role !== "student") {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setNotifications([]);
        return;
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    const token = localStorage.getItem("token");
    if (!notification.isRead && token) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/${notification._id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      } catch {
        // Silently fail
      }
    }
    if (notification.target) {
      navigate(notification.target);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 border rounded-xl bg-white flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
      </div>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications</p>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-60 space-y-2 pr-2">
          {notifications.map((notif) => (
            <button
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full text-left rounded-lg p-3 transition-all ${
                notif.isRead
                  ? 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
              }`}
            >
              <p className={`text-sm ${notif.isRead ? 'font-normal' : 'font-semibold'}`}>
                {notif.message}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {new Date(notif.createdAt).toLocaleDateString('en-IN')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}