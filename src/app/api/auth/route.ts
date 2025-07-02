import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!process.env.APP_PASSWORD) {
        console.error('APP_PASSWORD environment variable is not set.');
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    if (password === process.env.APP_PASSWORD) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
