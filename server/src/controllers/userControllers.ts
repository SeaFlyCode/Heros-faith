import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Story } from '../models/story';
import { Page } from '../models/page';
import { Party } from '../models/party';
import { Rating } from '../models/rating';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware';
import fs from 'fs';
import path from 'path';

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

// Récupérer les statistiques d'un utilisateur
export async function getUserStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId est requis' });
    }

    console.log('📊 Récupération des statistiques pour:', userId);

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userObjectId = user._id;

    // 1. Histoires écrites par l'utilisateur
    const storiesWritten = await Story.countDocuments({ author: userObjectId });

    // 2. Pages/chapitres écrits (pages des histoires de l'utilisateur)
    const userStories = await Story.find({ author: userObjectId }).select('_id');
    const storyIds = userStories.map(s => s._id);
    const pagesWritten = await Page.countDocuments({ story_id: { $in: storyIds } });

    // 3. Histoires lues (parties uniques par story_id)
    const partiesRead = await Party.aggregate([
      { $match: { user_id: userObjectId } },
      { $group: { _id: '$story_id' } },
      { $count: 'count' }
    ]);
    const storiesRead = partiesRead[0]?.count || 0;

    // 4. Parties totales (sessions de lecture)
    const totalParties = await Party.countDocuments({ user_id: userObjectId });

    // 5. Parties terminées
    const completedParties = await Party.countDocuments({ 
      user_id: userObjectId,
      end_date: { $ne: null }
    });

    // 6. Note moyenne reçue sur ses histoires
    const ratingsReceived = await Rating.aggregate([
      { $match: { story_id: { $in: storyIds } } },
      { 
        $group: { 
          _id: null, 
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        } 
      }
    ]);
    const averageRating = ratingsReceived[0]?.averageRating || 0;
    const totalRatingsReceived = ratingsReceived[0]?.totalRatings || 0;

    // 7. Notes données par l'utilisateur
    const ratingsGiven = await Rating.countDocuments({ user_id: userObjectId });

    // 8. Date d'inscription
    const memberSince = user.createdAt;

    const stats = {
      storiesWritten,
      pagesWritten,
      storiesRead,
      totalParties,
      completedParties,
      averageRating: Math.round(averageRating * 10) / 10, // Arrondi à 1 décimale
      totalRatingsReceived,
      ratingsGiven,
      memberSince
    };

    console.log('✅ Statistiques récupérées:', stats);

    res.json(stats);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des statistiques:', err);
    next(err);
  }
}

// À la fin du fichier, après getUserStats
export async function uploadProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur modifie bien son propre profil
    const authenticatedUser = req.user as any;
    if (authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre propre profil' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Trouver l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      // Supprimer le fichier uploadé si l'utilisateur n'existe pas
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancienne photo de profil si elle existe
    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '../../uploads', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('🗑️ Ancienne photo de profil supprimée:', user.profilePicture);
      }
    }

    // Sauvegarder le nom du fichier dans la BD
    user.profilePicture = req.file.filename;
    await user.save();

    console.log('✅ [Server] Photo de profil uploadée:', req.file.filename);
    console.log('📸 [Server] Données utilisateur après upload:', {
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      profilePictureUrl: `/api/uploads/${user.profilePicture}`
    });

    // Retourner l'URL de la photo de profil
    res.json({
      message: 'Photo de profil uploadée avec succès',
      profilePicture: user.profilePicture,
      profilePictureUrl: `/api/uploads/${user.profilePicture}`
    });
  } catch (err) {
    // En cas d'erreur, supprimer le fichier uploadé
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Erreur lors de l\'upload de la photo de profil:', err);
    next(err);
  }
}

export async function deleteProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    console.log('🗑️ [Server] Début de la suppression de photo de profil:', { userId });

    // Vérifier que l'utilisateur modifie bien son propre profil
    const authenticatedUser = req.user as any;
    if (authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
      console.log('❌ [Server] Tentative de suppression non autorisée');
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre propre profil' });
    }

    // Trouver l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ [Server] Utilisateur non trouvé');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.profilePicture) {
      console.log('❌ [Server] Aucune photo de profil à supprimer');
      return res.status(404).json({ message: 'Aucune photo de profil à supprimer' });
    }

    console.log('📸 [Server] Photo de profil à supprimer:', user.profilePicture);

    // Supprimer le fichier du système de fichiers
    const imagePath = path.join(__dirname, '../../uploads', user.profilePicture);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('✅ [Server] Fichier supprimé du système:', user.profilePicture);
    } else {
      console.log('⚠️ [Server] Fichier non trouvé sur le système:', imagePath);
    }

    // Supprimer la référence dans la BD
    user.profilePicture = '';
    await user.save();

    console.log('✅ [Server] Photo de profil supprimée de la BD pour:', user.username);

    res.json({ message: 'Photo de profil supprimée avec succès' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression de la photo de profil:', err);
    next(err);
  }
}
