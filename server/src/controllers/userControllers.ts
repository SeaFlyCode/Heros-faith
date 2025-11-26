import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.ts';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password: pwd, role } = req.body;

    // Log pour déboguer
    console.log('📝 Données reçues pour inscription:', { username, email, role, hasPassword: !!pwd });

    // Vérifier que tous les champs sont fournis
    if (!username || !email || !pwd) {
      console.log('❌ Champs manquants:', { username: !!username, email: !!email, password: !!pwd });
      return res.status(400).json({ message: 'Username, email et password sont requis' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(pwd, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    await user.save();

    console.log('✅ Utilisateur créé avec succès:', { id: user._id, username: user.username, role: user.role });

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userResponse } = user.toObject();
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', err);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password: pwd } = req.body;

    console.log('🔐 Tentative de connexion pour:', email);

    // Vérifier que email et password sont fournis
    if (!email || !pwd) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et password sont requis' });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Comparer les mots de passe
    const passwordMatch = await bcrypt.compare(pwd, user.password);
    if (!passwordMatch) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer un JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET non défini');
      return res.status(500).json({ message: 'JWT_SECRET non défini dans les variables d\'environnement' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      secret,
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie pour:', email, '- Role:', user.role);

    // Retourner le token et les infos utilisateur (sans le mot de passe)
    const { password, ...userResponse } = user.toObject();

    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('❌ Erreur lors de la connexion:', err);
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { username, email, password, currentPassword } = req.body;

    console.log('📝 Mise à jour de l\'utilisateur:', { userId, username, email, hasPassword: !!password });
    console.log('📋 req.body complet:', req.body);
    console.log('🔍 Type de username:', typeof username, '- Valeur:', username);
    console.log('🔍 Type de email:', typeof email, '- Valeur:', email);

    // Vérifier que l'utilisateur modifie bien son propre profil
    const authenticatedUser = req.user as any;
    if (authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
      console.log('❌ Tentative de modification d\'un autre profil');
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre propre profil' });
    }

    // Trouver l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Si on veut changer le mot de passe, vérifier l'ancien
    if (password) {
      if (!currentPassword) {
        console.log('❌ Mot de passe actuel manquant');
        return res.status(400).json({ message: 'Le mot de passe actuel est requis pour changer le mot de passe' });
      }

      // Vérifier que le mot de passe actuel est correct
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        console.log('❌ Mot de passe actuel incorrect');
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }

      // Hasher le nouveau mot de passe
      user.password = await bcrypt.hash(password, 10);
      console.log('✅ Mot de passe mis à jour');
    }

    // Mettre à jour les autres champs
    if (username) user.username = username;
    if (email) user.email = email;

    // Sauvegarder
    await user.save();

    console.log('✅ Utilisateur mis à jour avec succès:', { id: user._id, username: user.username });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userResponse } = user.toObject();
    res.json(userResponse);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour:', err);
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
