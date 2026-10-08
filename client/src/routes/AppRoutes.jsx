import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../app/AppShell.jsx';
import { ChatPage } from '../pages/ChatPage.jsx';
import { HistoryPage } from '../pages/HistoryPage.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { PracticePage } from '../pages/PracticePage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { ReviewPage } from '../pages/ReviewPage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { getCurrentPath, routeHref } from './navigation.js';

const SHELL_ROUTES = {
  '/home': { label: '首页', element: <HomePage /> },
  '/chat': { label: '对话', element: <ChatPage /> },
  '/history': { label: '历史', element: <HistoryPage /> },
  '/profile': { label: '画像', element: <ProfilePage /> },
  '/practice': { label: '刷题', element: <PracticePage /> },
  '/review': { label: '复习', element: <ReviewPage /> },
  '/settings': { label: '设置', element: <SettingsPage /> },
};

export function AppRoutes() {
  const [path, setPath] = useState(() => normalizePath(getCurrentPath()));

  useEffect(() => {
    if (!window.location.hash.startsWith('#/')) {
      window.history.replaceState({}, '', routeHref('/landing'));
      setPath('/landing');
    }

    function handlePopState() {
      setPath(normalizePath(getCurrentPath()));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const route = useMemo(() => SHELL_ROUTES[path], [path]);

  if (path === '/landing') {
    return <LandingPage />;
  }

  if (!route) {
    return <LandingPage />;
  }

  return (
    <AppShell activePath={path} pageTitle={route.label}>
      {route.element}
    </AppShell>
  );
}

function normalizePath(path) {
  const value = String(path || '').replace(/\/+$/, '') || '/';
  if (value === '/') {
    return '/landing';
  }

  return value;
}
