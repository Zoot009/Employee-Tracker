import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmployeeSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/employees - Get all employees
export async function GET() {
  try {
    // Check if Prisma is properly initialized
    await prisma.$connect();
    
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    
    // Return more detailed error information for debugging
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    // Check if Prisma is properly initialized
    await prisma.$connect();

    // Check if employee with same email or employee code exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { employeeCode: validatedData.employeeCode },
        ],
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee with this email or employee code already exists',
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
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

    console.error('Error creating employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}