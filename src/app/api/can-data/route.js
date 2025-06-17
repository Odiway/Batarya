// app/api/can-data/route.js (veya route.ts)
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
  // <--- Add 'req' here
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('bus_sensor_data');

    const body = await req.json(); // req.json() ile body'yi parse edin
    const newData = {
      ...body,
      receivedAt: new Date(), // Next.js'e ulaştığı zaman
      timestamp: new Date(body.timestamp), // String ISO zaman damgasını Date objesine çevir
    };

    const result = await collection.insertOne(newData);
    // console.log("Data inserted:", result.insertedId); // Konsol gürültüsünü azaltmak için kapatıldı
    return NextResponse.json(
      { message: 'Data received and stored successfully!', id: result.insertedId },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error storing data:', error);
    return NextResponse.json(
      { message: 'Error storing data', error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(res) {
  // 'res' here is the Request object, consider renaming to 'req' for clarity
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('bus_sensor_data');

    // En yeni 500 veriyi (yaklaşık son 40 dk) çekelim ki analiz için yeterli geçmiş olsun
    const data = await collection.find({}).sort({ timestamp: -1 }).limit(5000).toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Error fetching data', error: error.message },
      { status: 500 },
    );
  }
}
