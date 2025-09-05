import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTagSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/tags - Get all tags
export async function GET() {
  try {
    await prisma.$connect();
    
    const tags = await prisma.tag.findMany({
      orderBy: { tagName: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    await prisma.$connect();

    // Check if tag with same name exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        tagName: validatedData.tagName,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag with this name already exists',
        },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tag created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error,
        },
        { status: 400 }
      );
    }

    console.error('Error creating tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tag',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}