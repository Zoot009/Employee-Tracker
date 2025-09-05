// src/app/api/logs/by-date/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { employeeQuerySchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/logs/by-date - Get logs by specific date and employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = employeeQuerySchema.parse(query);

    if (!validatedQuery.employeeId || !validatedQuery.logDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID and log date are required',
        },
        { status: 400 }
      );
    }

    await prisma.$connect();

    const logs = await prisma.log.findMany({
      where: {
        employeeId: validatedQuery.employeeId,
        logDate: new Date(validatedQuery.logDate),
      },
      include: {
        employee: true,
        tag: true,
      },
      orderBy: {
        tag: { tagName: 'asc' },
      },
    });

    // Also check submission status
    const submissionStatus = await prisma.submissionStatus.findUnique({
      where: {
        employee_date: {
          employeeId: validatedQuery.employeeId,
          submissionDate: new Date(validatedQuery.logDate),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: logs,
      submissionStatus,
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

    console.error('Error fetching logs by date:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}