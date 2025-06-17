import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB_NAME; // Veritabanı adınız (örneğin, "batarya_db")

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents creating multiple connections to the database
 * during development.
 */
const cached = global as unknown as { mongoClient: MongoClient | null; db: Db | null };

if (!cached.mongoClient) {
  cached.mongoClient = null;
}

export async function connectToDatabase() {
  if (cached.mongoClient && cached.db) {
    return { mongoClient: cached.mongoClient, db: cached.db };
  }

  const opts = {
    // useNewUrlParser: true, // MongoDB sürücüsünün 4.x sürümünde artık gerekli değil
    // useUnifiedTopology: true, // MongoDB sürücüsünün 4.x sürümünde artık gerekli değil
  };

  try {
    const client = await MongoClient.connect(MONGODB_URI as string, opts);
    const db = client.db(MONGODB_DB);

    cached.mongoClient = client;
    cached.db = db;

    return { mongoClient: client, db: db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

// İsteğe bağlı: Bağlantıyı kapatmak için bir fonksiyon
export async function closeDatabaseConnection() {
  if (cached.mongoClient) {
    await cached.mongoClient.close();
    cached.mongoClient = null;
    cached.db = null;
    console.log('MongoDB bağlantısı kapatıldı.');
  }
}

// Geliştirme ortamında, Next.js'in sıcak yeniden yüklemeleri sırasında
// global objenin tekrar kullanılması için __NEXT_MONGODB_CLIENT__ ve __NEXT_MONGODB_DB__
// gibi özel isimler yerine doğrudan 'global' kullanmak yeterlidir.
// Bu dosya, Next.js'in "Serverless Functions" veya API Routes ortamında çalışacak şekilde tasarlanmıştır.
