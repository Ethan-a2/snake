import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    const { playerName, score } = await request.json();

    if (!playerName || !score) {
      return NextResponse.json({ message: 'Missing player name or score' }, { status: 400 });
    }

    const query = 'INSERT INTO public.player_score (player_name, score) VALUES ($1, $2)';
    const values = [playerName, score];

    await pool.query(query, values);

    return NextResponse.json({ message: 'Score saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ message: 'Error saving score' }, { status: 500 });
  }
}
