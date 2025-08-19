declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackFactionJoin = (factionName: string) => {
  event({
    action: 'join_faction',
    category: 'engagement',
    label: factionName,
  });
};

export const trackPageView = (pageName: string) => {
  event({
    action: 'page_view',
    category: 'navigation',
    label: pageName,
  });
};

export const trackFeatureUse = (feature: string) => {
  event({
    action: 'use_feature',
    category: 'interaction',
    label: feature,
  });
};

export const trackUserRetention = (daysActive: number) => {
  event({
    action: 'user_retention',
    category: 'engagement',
    value: daysActive,
  });
};

export const trackSearchQuery = (query: string) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
  });
};
