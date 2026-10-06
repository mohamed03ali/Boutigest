// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const limiteurAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 10, // 10 tentatives max par IP sur cette fenêtre
  message: { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});