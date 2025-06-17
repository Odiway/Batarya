// app/api/predictions/route.js (veya route.ts)
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('predictions'); // Yeni koleksiyon adı

    const body = await req.json();
    const newPrediction = {
      ...body,
      predicted_at: new Date(body.predicted_at), // String'i Date objesine çevir
      timestamp_data_end: new Date(body.timestamp_data_end), // String'i Date objesine çevir
    };

    const result = await collection.insertOne(newPrediction);
    // console.log("Prediction inserted:", result.insertedId); // Konsol gürültüsünü azaltmak için kapatıldı
    return NextResponse.json(
      { message: 'Prediction received and stored successfully!', id: result.insertedId },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error storing prediction:', error);
    return NextResponse.json(
      { message: 'Error storing prediction', error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('predictions');

    // En yeni 50 tahmini çekelim
    const data = await collection.find({}).sort({ predicted_at: -1 }).limit(50).toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { message: 'Error fetching predictions', error: error.message },
      { status: 500 },
    );
  }
}
