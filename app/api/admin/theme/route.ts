import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { selectedTheme, randomTheme } = body;

    // Validation
    if (typeof selectedTheme !== 'number' || selectedTheme < 1 || selectedTheme > 6) {
      return NextResponse.json(
        { error: 'Invalid theme selection. Must be between 1-6' },
        { status: 400 }
      );
    }

    if (typeof randomTheme !== 'boolean') {
      return NextResponse.json(
        { error: 'randomTheme must be a boolean' },
        { status: 400 }
      );
    }

    // Update theme settings
    await db.updateThemeSettings(selectedTheme, randomTheme);

    return NextResponse.json({
      success: true,
      selectedTheme,
      randomTheme,
    });
  } catch (error) {
    console.error('Error updating theme settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
