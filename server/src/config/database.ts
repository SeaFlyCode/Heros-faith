import mongoose from 'mongoose';
import type { ConnectOptions } from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("La variable d'environnement MONGODB_URI est manquante.");
    }
    const options: ConnectOptions = {
      dbName: process.env.DB_NAME || 'herosFaithDB'
    };
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB connecté : ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.error('Erreur de connexion à MongoDB :', error.message);
    process.exit(1);
  }
}

export async function closeDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée.');
  } catch (error: any) {
    console.error("Erreur lors de la fermeture de la connexion :", error.message);
    process.exit(1);
  }
}
