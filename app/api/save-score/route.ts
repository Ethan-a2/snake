import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'scores.json');

export async function POST(request: Request) {
  try {
    const { playerName, score } = await request.json();

    if (!playerName || !score) {
      return NextResponse.json({ message: 'Missing player name or score' }, { status: 400 });
    }

    // Read existing scores from the JSON file
    let scores = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf8');
      scores = JSON.parse(fileContent);
    } catch (error: any) {
      // If the file doesn't exist or is empty, start with an empty array
      if (error.code === 'ENOENT') {
        scores = [];
      } else {
        console.error('Error reading scores file:', error);
        return NextResponse.json({ message: 'Error reading scores' }, { status: 500 });
      }
    }

    // Add the new score
    scores.push({ playerName, score });

    // Write the updated scores back to the JSON file
    await fs.writeFile(dataFilePath, JSON.stringify(scores, null, 2));

    return NextResponse.json({ message: 'Score saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ message: 'Error saving score' }, { status: 500 });
  }
}
