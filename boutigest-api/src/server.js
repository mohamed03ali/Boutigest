import { assertRequiredEnvironment } from './config/env.js';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import boutiquesRoutes from './routes/boutiques.js';
import produitsRoutes from './routes/produits.js';
import clientsRoutes from './routes/clients.js';
import ventesRoutes from './routes/ventes.js';
import dettesRoutes from './routes/dettes.js';
import depensesRoutes from './routes/depenses.js';
import mouvementsRoutes from './routes/mouvements.js';
import zakatsRoutes from './routes/zakats.js';
import notificationsRoutes from './routes/notifications.js';
import categoriesRoutes from './routes/categories.js';
import utilisateursRoutes from './routes/utilisateurs.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/boutiques', boutiquesRoutes);
app.use('/produits', produitsRoutes);
app.use('/clients', clientsRoutes);
app.use('/ventes', ventesRoutes);
app.use('/dettes', dettesRoutes);
app.use('/depenses', depensesRoutes);
app.use('/mouvements', mouvementsRoutes);
app.use('/zakats', zakatsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/utilisateurs', utilisateursRoutes);	

app.get('/', (req, res) => res.json({ message: 'Boutigest API en ligne' }));

const PORT = process.env.PORT || 3000;

try {
	assertRequiredEnvironment();
	await db.query('SELECT 1');
	app.listen(PORT, () => console.log(`API et MySQL prêts sur http://localhost:${PORT}`));
} catch (error) {
	console.error('Connexion MySQL impossible:', error.message);
	process.exitCode = 1;
}
