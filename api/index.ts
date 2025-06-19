import express from 'express';
import { registerRoutes } from '../server/routes';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
await registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(process.cwd(), 'dist', 'public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
}

export default app;