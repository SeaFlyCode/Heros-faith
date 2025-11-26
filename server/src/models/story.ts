import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IReport {
  reported: boolean;
  reporter?: mongoose.Types.ObjectId;
  reportDate?: Date;
}

export interface ICensorship {
  censored: boolean;
  admin?: mongoose.Types.ObjectId;
  censorshipDate?: Date;
  reason?: string;
}

export interface IStory extends Document {
  title: string;
  description?: string;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  comments: IComment[];
  report: IReport;
  censorship: ICensorship;
}

const CommentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const StorySchema: Schema<IStory> = new Schema<IStory>({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  comments: { type: [CommentSchema], default: [] },
  report: {
    reported: { type: Boolean, default: false },
    reporter: { type: Schema.Types.ObjectId, ref: 'User' },
    reportDate: { type: Date }
  },
  censorship: {
    censored: { type: Boolean, default: false },
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    censorshipDate: { type: Date },
    reason: { type: String }
  }
}, {
  timestamps: true
});

// Hook pour supprimer en cascade toutes les entités liées quand une histoire est supprimée
StorySchema.pre('findOneAndDelete', async function() {
  try {
    const filter = this.getFilter();
    const storyId = (filter as any)._id;

    if (!storyId) {
      console.warn('⚠️ Aucun storyId trouvé dans la requête de suppression');
      return;
    }

    // Utiliser mongoose.model pour accéder aux modèles déjà enregistrés (évite les imports circulaires)
    const Page = mongoose.model('Page');
    const Choice = mongoose.model('Choice');
    const Party = mongoose.model('Party');
    const Rating = mongoose.model('Rating');

    // Supprimer toutes les pages de cette histoire
    const pages = await Page.find({ story_id: storyId });
    const pageIds = pages.map((p: any) => p._id);

    // Supprimer tous les choix liés aux pages
    if (pageIds.length > 0) {
      await Choice.deleteMany({ page_id: { $in: pageIds } });
    }

    // Supprimer toutes les pages
    await Page.deleteMany({ story_id: storyId });

    // Supprimer toutes les parties (sessions de jeu) liées à cette histoire
    await Party.deleteMany({ story_id: storyId });

    // Supprimer tous les ratings liés à cette histoire
    await Rating.deleteMany({ story_id: storyId });

    console.log(`✅ Histoire ${storyId} et toutes ses entités liées supprimées`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression en cascade:', error);
    throw error;
  }
});

export const Story: Model<IStory> = mongoose.model<IStory>('Story', StorySchema);
