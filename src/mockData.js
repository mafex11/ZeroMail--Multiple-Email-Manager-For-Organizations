export const mockMessages = [
  {
    id: 'otp1',
    subject: 'Your Google verification code',
    from: 'Google <noreply@google.com>',
    date: new Date(Date.now() - 1000 * 30).toISOString(), // 30 seconds ago
    snippet: 'Your Google verification code is 123456. Use this code to complete your sign-in. This code expires in 10 minutes.',
    accountEmail: 'user1@gmail.com',
    isUnread: true,
  },
  {
    id: 'otp2',
    subject: 'Banking Security Code',
    from: 'Chase Bank <security@chase.com>',
    date: new Date(Date.now() - 1000 * 60).toISOString(), // 1 minute ago
    snippet: 'Your one-time password for online banking is 789012. This code is valid for 5 minutes only.',
    accountEmail: 'user2@gmail.com',
    isUnread: true,
  },
  {
    id: 'otp3',
    subject: 'Instagram Login Code',
    from: 'Instagram <security@instagram.com>',
    date: new Date(Date.now() - 1000 * 45).toISOString(), // 45 seconds ago
    snippet: 'Your Instagram login code is 456789. Don\'t share this with anyone.',
    accountEmail: 'user1@gmail.com',
    isUnread: true,
  },
  {
    id: 'msg1',
    subject: 'Your Weekly Newsletter',
    from: 'Medium Daily Digest <noreply@medium.com>',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    snippet: 'Featured stories: "10 React Hooks You Should Know", "The Future of Web Development", and more...',
    accountEmail: 'user1@gmail.com',
    isUnread: true,
  },
  {
    id: 'msg2',
    subject: 'Meeting Tomorrow at 2 PM',
    from: 'Sarah Johnson <sarah.j@company.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    snippet: 'Hi, just confirming our team meeting tomorrow at 2 PM. Please review the attached agenda before the meeting.',
    accountEmail: 'user1@gmail.com',
    isUnread: true,
  },
  {
    id: 'msg3',
    subject: 'Your Order #12345 Has Shipped!',
    from: 'Amazon.com <shipping-updates@amazon.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    snippet: 'Good news! Your package has shipped and is on its way. Expected delivery date: Friday, March 15',
    accountEmail: 'user2@gmail.com',
    isUnread: false,
  },
  {
    id: 'msg4',
    subject: 'Pull Request Review Requested',
    from: 'GitHub <notifications@github.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    snippet: '[user/repo] PR #123: "Add new feature" - @developer has requested your review on this pull request.',
    accountEmail: 'user2@gmail.com',
    isUnread: true,
  },
  {
    id: 'msg5',
    subject: 'Weekend Sale - 50% Off!',
    from: 'Fashion Store <deals@fashion.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    snippet: 'Don\'t miss out! This weekend only - 50% off all items. Shop now while supplies last.',
    accountEmail: 'user1@gmail.com',
    isUnread: false,
  },
  {
    id: 'msg6',
    subject: 'Your Subscription is Expiring Soon',
    from: 'Netflix <info@netflix.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    snippet: 'Your Netflix subscription will expire in 3 days. Update your payment method to continue watching.',
    accountEmail: 'user2@gmail.com',
    isUnread: true,
  },
  {
    id: 'msg7',
    subject: 'Project Status Update',
    from: 'Project Manager <pm@company.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    snippet: 'Here\'s the weekly project status update. We\'re on track for the Q1 deliverables.',
    accountEmail: 'user1@gmail.com',
    isUnread: false,
  },
  {
    id: 'msg8',
    subject: 'Security Alert',
    from: 'Google <no-reply@google.com>',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    snippet: 'New sign-in detected on Windows device. If this wasn\'t you, please secure your account.',
    accountEmail: 'user2@gmail.com',
    isUnread: true,
  }
]; 