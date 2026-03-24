import { useState, useEffect, useMemo } from 'react';
import { subscribeFridgeiqKeys } from '@/lib/fridgeiqStorage';

const timezoneOptions = [
  'Auto',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export { timezoneOptions };

const getTimezone = (): string => {
  try {
    const settings = localStorage.getItem('fridgeiq_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.timezone && parsed.timezone !== 'Auto') return parsed.timezone;
    }
  } catch {}
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getIdentity = () => {
  let name = 'Chef';
  let emoji = '👨‍🍳';
  try {
    const profile = localStorage.getItem('fridgeiq_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.name) name = parsed.name;
      if (parsed.avatarEmoji) emoji = parsed.avatarEmoji;
    }
  } catch {}
  if (name === 'Chef') {
    const stored = localStorage.getItem('fridgeiq_username');
    if (stored) name = stored;
  }
  return { firstName: name.split(' ')[0], avatarEmoji: emoji };
};

export const useGreeting = () => {
  const [identity, setIdentity] = useState(getIdentity);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return subscribeFridgeiqKeys(
      ['fridgeiq_profile', 'fridgeiq_username', 'fridgeiq_settings'],
      () => setIdentity(getIdentity())
    );
  }, []);

  const tz = getTimezone();

  const timeString = useMemo(() => {
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    });
  }, [now, tz]);

  const greeting = useMemo(() => {
    const hour = parseInt(
      now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz })
    );
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }, [now, tz]);

  const greetingEmoji = useMemo(() => {
    const hour = parseInt(
      now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz })
    );
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 21) return '🌇';
    return '🌙';
  }, [now, tz]);

  return {
    ...identity,
    greeting,
    greetingEmoji,
    timeString,
    timezone: tz,
  };
};
