import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const mockContacts = Array.from({ length: 20 }, (_, i) => ({
  id: `contact-${i + 1}`,
  name: `Customer ${i + 1}`,
  phone: `+123456789${i.toString().padStart(2, '0')}`,
  email: `customer${i + 1}@example.com`,
  status: i % 2 === 0 ? 'ACTIVE' : 'INACTIVE',
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const mockWorkspaces = [
  { id: 'ws-1', name: 'Real Estate CRM', slug: 'real-estate' },
  { id: 'ws-2', name: 'E-commerce Support', slug: 'ecommerce' },
  { id: 'ws-3', name: 'Dental Clinic', slug: 'dental' },
  { id: 'ws-4', name: 'SaaS Beta', slug: 'saas' },
];

app.use((req, res, next) => {
  console.log(`[Bridge] ${req.method} ${req.url}`);
  next();
});

app.post('/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: 'admin-1',
      email: req.body.email || 'admin@autowhats.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
});

app.get('/auth/me', (req, res) => {
  res.json({
    id: 'admin-1',
    email: 'admin@autowhats.com',
    name: 'Admin User',
    role: 'ADMIN',
  });
});

app.get('/workspaces', (req, res) => res.json(mockWorkspaces));
app.get('/contacts', (req, res) => res.json(mockContacts));
app.get('/conversations', (req, res) => {
  const conversations = mockContacts.map((c) => ({
    id: `convo-${c.id}`,
    status: 'OPEN',
    lastMessageAt: new Date().toISOString(),
    unreadCount: Math.floor(Math.random() * 2),
    contact: { name: c.name, phone: c.phone },
    messages: [
      {
        id: `msg-${c.id}`,
        content: `Hello! I'm interested in ${c.name}'s services.`,
        direction: 'INBOUND',
        status: 'READ',
        type: 'TEXT',
        timestamp: new Date().toISOString(),
      },
    ],
  }));
  res.json(conversations);
});

app.get('/system/usage', (req, res) => {
  res.json({
    ai: { limit: 1000, current: 780, percentage: 78, warning: true },
    media: {
      limit: 500,
      current: 310,
      currentMB: 310,
      percentage: 62,
      warning: false,
    },
  });
});

const port = 3000;
// Bind to 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 STANDALONE Mock Bridge running on http://0.0.0.0:${port}`);
});
