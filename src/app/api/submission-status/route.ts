// src/app/api/submission-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { employeeQuerySchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/submission-status - Get submission status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    let validatedQuery;
    try {
      validatedQuery = employeeQuerySchema.parse(query);
    } catch (validationError) {
      validatedQuery = {};
    }

    await prisma.$connect();

    const where: any = {};

    if (validatedQuery.employeeId) {
      where.employeeId = validatedQuery.employeeId;
    }

    if (validatedQuery.logDate) {
      where.submissionDate = new Date(validatedQuery.logDate);
    }

    if (validatedQuery.dateFrom && validatedQuery.dateTo) {
      where.submissionDate = {
        gte: new Date(validatedQuery.dateFrom),
        lte: new Date(validatedQuery.dateTo),
      };
    }

    const submissionStatuses = await prisma.submissionStatus.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: [
        { submissionDate: 'desc' },
        { submissionTime: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: submissionStatuses,
    });
  } catch (error) {
    console.error('Error fetching submission statuses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submission statuses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}