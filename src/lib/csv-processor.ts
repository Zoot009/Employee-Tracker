// src/lib/csv-processor.ts - CSV Processing System
import Papa from 'papaparse';
import { prisma } from '@/lib/prisma';
import { ImportType, ImportStatus } from '@prisma/client';

// Expected CSV formats
export interface AttendanceCSVRow {
  employeeCode: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: 'Present' | 'Absent' | 'Late' | 'Half Day';
  totalHours?: string;
  department?: string;
}

export interface FlowaceCSVRow {
  employeeCode: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalMinutes?: string;
  activeMinutes?: string;
  idleMinutes?: string;
  applications?: string; // JSON string
  websites?: string;     // JSON string
  screenshots?: string;
  keystrokes?: string;
  mouseClicks?: string;
}

export interface CSVProcessResult {
  success: boolean;
  batchId: string;
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

/**
 * Process attendance CSV file
 */
export async function processAttendanceCSV(
  file: File,
  uploadedBy?: number
): Promise<CSVProcessResult> {
  
  const batchId = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create import log
  const importLog = await prisma.importLog.create({
    data: {
      fileName: file.name,
      fileType: ImportType.ATTENDANCE_CSV,
      status: ImportStatus.PROCESSING,
      batchId,
      uploadedBy,
    },
  });

  try {
    // Parse CSV
    const csvText = await file.text();
    const parseResult = Papa.parse<AttendanceCSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for validation
      delimitersToGuess: [',', '\t', '|', ';'],
    });

    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`);
    }

    const result: CSVProcessResult = {
      success: true,
      batchId,
      totalRecords: parseResult.data.length,
      processedRecords: 0,
      errorRecords: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      
      try {
        await processAttendanceRow(row, batchId, i + 1);
        result.processedRecords++;
      } catch (error) {
        result.errorRecords++;
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row,
        });
      }
    }

    // Update import log
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: result.errorRecords === 0 ? ImportStatus.COMPLETED : ImportStatus.PARTIALLY_COMPLETED,
        totalRecords: result.totalRecords,
        processedRecords: result.processedRecords,
        errorRecords: result.errorRecords,
        errors: result.errors,
        completedAt: new Date(),
      },
    });

    return result;

  } catch (error) {
    // Update import log with failure
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: ImportStatus.FAILED,
        errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

/**
 * Process single attendance row
 */
async function processAttendanceRow(
  row: AttendanceCSVRow, 
  batchId: string, 
  rowNumber: number
): Promise<void> {
  
  // Validate required fields
  if (!row.employeeCode || !row.date) {
    throw new Error('Employee code and date are required');
  }

  // Find employee
  const employee = await prisma.employee.findUnique({
    where: { employeeCode: row.employeeCode },
  });

  if (!employee) {
    throw new Error(`Employee not found: ${row.employeeCode}`);
  }

  // Parse date
  const date = new Date(row.date);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${row.date}`);
  }

  // Parse times
  let checkInTime: Date | undefined;
  let checkOutTime: Date | undefined;
  let totalHours: number | undefined;

  if (row.checkIn) {
    checkInTime = parseDateTime(row.date, row.checkIn);
  }

  if (row.checkOut) {
    checkOutTime = parseDateTime(row.date, row.checkOut);
  }

  if (row.totalHours) {
    totalHours = parseFloat(row.totalHours);
  }

  // Map status
  const status = mapAttendanceStatus(row.status);

  // Create or update attendance record
  await prisma.attendanceRecord.upsert({
    where: {
      employee_date_attendance: {
        employeeId: employee.id,
        date,
      },
    },
    update: {
      status,
      checkInTime,
      checkOutTime,
      totalHours,
      importSource: 'csv',
      importBatch: batchId,
    },
    create: {
      employeeId: employee.id,
      date,
      status,
      checkInTime,
      checkOutTime,
      totalHours,
      importSource: 'csv',
      importBatch: batchId,
    },
  });
}

/**
 * Process Flowace CSV file
 */
export async function processFlowaceCSV(
  file: File,
  uploadedBy?: number
): Promise<CSVProcessResult> {
  
  const batchId = `flowace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const importLog = await prisma.importLog.create({
    data: {
      fileName: file.name,
      fileType: ImportType.FLOWACE_CSV,
      status: ImportStatus.PROCESSING,
      batchId,
      uploadedBy,
    },
  });

  try {
    const csvText = await file.text();
    const parseResult = Papa.parse<FlowaceCSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimitersToGuess: [',', '\t', '|', ';'],
    });

    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`);
    }

    const result: CSVProcessResult = {
      success: true,
      batchId,
      totalRecords: parseResult.data.length,
      processedRecords: 0,
      errorRecords: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      
      try {
        await processFlowaceRow(row, batchId, i + 1);
        result.processedRecords++;
      } catch (error) {
        result.errorRecords++;
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row,
        });
      }
    }

    // Update import log
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: result.errorRecords === 0 ? ImportStatus.COMPLETED : ImportStatus.PARTIALLY_COMPLETED,
        totalRecords: result.totalRecords,
        processedRecords: result.processedRecords,
        errorRecords: result.errorRecords,
        errors: result.errors,
        completedAt: new Date(),
      },
    });

    return result;

  } catch (error) {
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: ImportStatus.FAILED,
        errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

/**
 * Process single Flowace row
 */
async function processFlowaceRow(
  row: FlowaceCSVRow, 
  batchId: string, 
  rowNumber: number
): Promise<void> {
  
  if (!row.employeeCode || !row.date || !row.startTime) {
    throw new Error('Employee code, date, and start time are required');
  }

  const employee = await prisma.employee.findUnique({
    where: { employeeCode: row.employeeCode },
  });

  if (!employee) {
    throw new Error(`Employee not found: ${row.employeeCode}`);
  }

  const date = new Date(row.date);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${row.date}`);
  }

  const startTime = parseDateTime(row.date, row.startTime);
  const endTime = row.endTime ? parseDateTime(row.date, row.endTime) : undefined;

  // Parse numeric fields
  const totalMinutes = row.totalMinutes ? parseInt(row.totalMinutes) : 0;
  const activeMinutes = row.activeMinutes ? parseInt(row.activeMinutes) : 0;
  const idleMinutes = row.idleMinutes ? parseInt(row.idleMinutes) : 0;
  const screenshots = row.screenshots ? parseInt(row.screenshots) : 0;
  const keystrokes = row.keystrokes ? parseInt(row.keystrokes) : 0;
  const mouseClicks = row.mouseClicks ? parseInt(row.mouseClicks) : 0;

  // Parse JSON fields
  let applications: any = null;
  let websites: any = null;

  try {
    if (row.applications) {
      applications = JSON.parse(row.applications);
    }
  } catch (e) {
    // If JSON parsing fails, store as string array
    applications = row.applications ? [row.applications] : null;
  }

  try {
    if (row.websites) {
      websites = JSON.parse(row.websites);
    }
  } catch (e) {
    websites = row.websites ? [row.websites] : null;
  }

  // Create Flowace record
  await prisma.flowaceRecord.create({
    data: {
      employeeId: employee.id,
      date,
      startTime,
      endTime,
      totalMinutes,
      activeMinutes,
      idleMinutes,
      applications,
      websites,
      screenshots,
      keystrokes,
      mouseClicks,
      importBatch: batchId,
      rawData: row, // Store original row data
    },
  });

  // Update attendance record with Flowace data
  await updateAttendanceWithFlowace(employee.id, date, totalMinutes);
}

/**
 * Update attendance record with Flowace work evidence
 */
async function updateAttendanceWithFlowace(
  employeeId: number, 
  date: Date, 
  flowaceMinutes: number
): Promise<void> {
  
  await prisma.attendanceRecord.upsert({
    where: {
      employee_date_attendance: {
        employeeId,
        date,
      },
    },
    update: {
      hasFlowaceWork: flowaceMinutes > 0,
      flowaceMinutes,
    },
    create: {
      employeeId,
      date,
      status: 'ABSENT', // Will be analyzed later
      hasFlowaceWork: flowaceMinutes > 0,
      flowaceMinutes,
      importSource: 'flowace',
    },
  });
}

// Utility functions
function parseDateTime(dateStr: string, timeStr: string): Date {
  const date = new Date(dateStr);
  const timeParts = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i);
  
  if (!timeParts) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  let hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);
  const seconds = timeParts[3] ? parseInt(timeParts[3]) : 0;
  const ampm = timeParts[4];

  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  }

  date.setHours(hours, minutes, seconds);
  return date;
}

function mapAttendanceStatus(status?: string) {
  switch (status?.toLowerCase()) {
    case 'present':
      return 'PRESENT';
    case 'absent':
      return 'ABSENT';
    case 'late':
      return 'LATE';
    case 'half day':
    case 'half_day':
      return 'HALF_DAY';
    default:
      return 'ABSENT';
  }
}

/**
 * Generate CSV templates
 */
export function generateAttendanceTemplate(): string {
  const headers = [
    'employeeCode',
    'employeeName',
    'date',
    'checkIn',
    'checkOut',
    'status',
    'totalHours',
    'department'
  ];

  const sampleRow = [
    'EMP001',
    'John Doe',
    '2024-01-15',
    '09:00 AM',
    '06:00 PM',
    'Present',
    '8.5',
    'Engineering'
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
}

export function generateFlowaceTemplate(): string {
  const headers = [
    'employeeCode',
    'employeeName',
    'date',
    'startTime',
    'endTime',
    'totalMinutes',
    'activeMinutes',
    'idleMinutes',
    'applications',
    'websites',
    'screenshots',
    'keystrokes',
    'mouseClicks'
  ];

  const sampleRow = [
    'EMP001',
    'John Doe',
    '2024-01-15',
    '09:00:00',
    '18:00:00',
    '480',
    '420',
    '60',
    '["Chrome", "VS Code", "Slack"]',
    '["github.com", "stackoverflow.com"]',
    '120',
    '5240',
    '1250'
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
}