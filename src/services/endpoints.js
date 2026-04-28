const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    google: '/auth/google',
    profile: '/auth/profile',
  },
  issues: {
    list: '/issues',
    detail: (issueId) => `/issues/${issueId}`,
    create: '/issues/create',
    timeline: (issueId) => `/issues/${issueId}/timeline`,
    nearby: '/issues/nearby',
    history: '/issues/history',
  },
  volunteers: {
    list: '/volunteers',
    detail: (volunteerId) => `/volunteers/${volunteerId}`,
    tasks: '/volunteers/tasks',
    availability: '/volunteers/availability',
    queue: '/volunteers/queue',
    performance: '/volunteers/performance',
    shifts: '/volunteers/shifts',
    acceptTask: '/volunteers/tasks/accept',
    declineTask: '/volunteers/tasks/decline',
    completeTask: '/volunteers/tasks/complete',
  },
  ngo: {
    dashboard: '/ngo/dashboard',
    issues: '/ngo/issues',
    volunteers: '/ngo/volunteers',
    analytics: '/ngo/analytics',
    autoAssign: '/ngo/auto-assign',
    updateIssue: '/ngo/issues/update',
  },
  notifications: {
    list: '/notifications',
    markRead: '/notifications/read',
    create: '/notifications/create',
  },
  chat: {
    threads: '/chat/threads',
    messages: (threadId) => `/chat/threads/${threadId}/messages`,
    send: '/chat/send',
  },
  resources: {
    recommendations: '/resources/recommendations',
    alerts: '/resources/alerts',
  },
};

export default endpoints;


