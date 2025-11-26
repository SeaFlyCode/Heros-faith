import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.ts';

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

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
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
