// src/lib/attendance-logic.ts - Core Logic for Attendance & Leave Management

import { 
  AttendanceStatus, 
  AttendanceException, 
  LeaveStatus, 
  LeaveType 
} from '@prisma/client';

export interface AttendanceAnalysis {
  finalStatus: AttendanceStatus;
  hasException: boolean;
  exceptionType?: AttendanceException;
  shouldIssueWarning: boolean;
  shouldIssuePenalty: boolean;
  workMinutes: number;
  notes: string[];
}

export interface DayData {
  // Leave Request Data
  leaveRequest?: {
    type: LeaveType;
    status: LeaveStatus;
  };
  
  // Attendance Data (from CSV or manual)
  attendance?: {
    checkIn?: Date;
    checkOut?: Date;
    totalHours?: number;
  };
  
  // Work Evidence
  workEvidence: {
    tagMinutes: number;    // From tag timer
    flowaceMinutes: number; // From flowace data
    hasAnyWork: boolean;
  };
}

/**
 * CORE LOGIC: Determine attendance status and exceptions
 * 
 * This is the heart of the system - it follows the hierarchy of truth:
 * 1. Leave Decision (Expected Status)
 * 2. Attendance Check-in/out (Actual Presence)
 * 3. Work Evidence (Actual Activity)
 */
export function analyzeAttendance(dayData: DayData): AttendanceAnalysis {
  const { leaveRequest, attendance, workEvidence } = dayData;
  
  let result: AttendanceAnalysis = {
    finalStatus: AttendanceStatus.ABSENT,
    hasException: false,
    shouldIssueWarning: false,
    shouldIssuePenalty: false,
    workMinutes: Math.max(workEvidence.tagMinutes, workEvidence.flowaceMinutes),
    notes: []
  };

  // SCENARIO 1: No Leave Request - Normal Day
  if (!leaveRequest) {
    return analyzeNormalDay(attendance, workEvidence, result);
  }

  // SCENARIO 2: Leave Request Exists
  switch (leaveRequest.status) {
    case LeaveStatus.PENDING:
      return analyzePendingLeave(leaveRequest, attendance, workEvidence, result);
      
    case LeaveStatus.APPROVED:
      return analyzeApprovedLeave(leaveRequest, attendance, workEvidence, result);
      
    case LeaveStatus.DENIED:
      return analyzeDeniedLeave(leaveRequest, attendance, workEvidence, result);
      
    default:
      return result;
  }
}

/**
 * Normal day analysis - no leave request
 */
function analyzeNormalDay(
  attendance: DayData['attendance'], 
  workEvidence: DayData['workEvidence'], 
  result: AttendanceAnalysis
): AttendanceAnalysis {
  
  const isPhysicallyPresent = attendance?.checkIn != null;
  const hasWork = workEvidence.hasAnyWork;
  
  if (isPhysicallyPresent && hasWork) {
    // Perfect scenario
    result.finalStatus = AttendanceStatus.PRESENT;
    result.notes.push("Normal working day");
    
  } else if (isPhysicallyPresent && !hasWork) {
    // Present but no work logged
    result.finalStatus = AttendanceStatus.PRESENT;
    result.hasException = true;
    result.exceptionType = AttendanceException.WORK_WITHOUT_CHECKIN;
    result.shouldIssueWarning = true;
    result.notes.push("Present but no work activity recorded");
    
  } else if (!isPhysicallyPresent && hasWork) {
    // Work logged but no check-in (possible WFH without approval)
    result.finalStatus = AttendanceStatus.PRESENT; // Count work as presence
    result.hasException = true;
    result.exceptionType = AttendanceException.WORK_WITHOUT_CHECKIN;
    result.shouldIssueWarning = true;
    result.notes.push("Work logged without check-in - possible unauthorized WFH");
    
  } else {
    // Neither present nor worked
    result.finalStatus = AttendanceStatus.ABSENT;
    result.shouldIssuePenalty = true;
    result.notes.push("Absent without leave request");
  }
  
  return result;
}

/**
 * Pending leave analysis
 */
function analyzePendingLeave(
  leaveRequest: DayData['leaveRequest'],
  attendance: DayData['attendance'],
  workEvidence: DayData['workEvidence'],
  result: AttendanceAnalysis
): AttendanceAnalysis {
  
  const isPhysicallyPresent = attendance?.checkIn != null;
  const hasWork = workEvidence.hasAnyWork;
  
  if (isPhysicallyPresent || hasWork) {
    // Employee worked while leave is pending
    result.finalStatus = AttendanceStatus.PRESENT;
    result.notes.push("Worked while leave request is pending");
    
  } else {
    // Employee absent while leave is pending
    result.finalStatus = AttendanceStatus.ABSENT;
    result.hasException = true;
    result.shouldIssueWarning = true;
    result.notes.push("Absent with pending leave request - treating as unauthorized absence");
  }
  
  return result;
}

/**
 * Approved leave analysis
 */
function analyzeApprovedLeave(
  leaveRequest: DayData['leaveRequest'],
  attendance: DayData['attendance'],
  workEvidence: DayData['workEvidence'],
  result: AttendanceAnalysis
): AttendanceAnalysis {
  
  const isPhysicallyPresent = attendance?.checkIn != null;
  const hasWork = workEvidence.hasAnyWork;
  
  if (leaveRequest!.type === LeaveType.FULL_LEAVE) {
    
    if (!isPhysicallyPresent && !hasWork) {
      // Perfect - on approved leave and didn't work
      result.finalStatus = AttendanceStatus.LEAVE_APPROVED;
      result.notes.push("On approved full leave");
      
    } else {
      // Exception: Worked on approved leave
      result.finalStatus = AttendanceStatus.LEAVE_APPROVED; // Keep status as leave
      result.hasException = true;
      result.exceptionType = AttendanceException.WORKED_ON_APPROVED_LEAVE;
      result.notes.push("Worked during approved full leave - work will be counted but flagged");
    }
    
  } else if (leaveRequest!.type === LeaveType.WORK_FROM_HOME) {
    
    if (hasWork) {
      // Perfect WFH - worked from home
      result.finalStatus = AttendanceStatus.WFH_APPROVED;
      result.notes.push("Successfully worked from home");
      
    } else {
      // Exception: WFH approved but no work
      result.finalStatus = AttendanceStatus.WFH_APPROVED;
      result.hasException = true;
      result.exceptionType = AttendanceException.NO_WORK_ON_WFH;
      result.shouldIssueWarning = true;
      result.notes.push("WFH approved but no work activity recorded");
    }
  }
  
  return result;
}

/**
 * Denied leave analysis
 */
function analyzeDeniedLeave(
  leaveRequest: DayData['leaveRequest'],
  attendance: DayData['attendance'],
  workEvidence: DayData['workEvidence'],
  result: AttendanceAnalysis
): AttendanceAnalysis {
  
  const isPhysicallyPresent = attendance?.checkIn != null;
  const hasWork = workEvidence.hasAnyWork;
  
  if (isPhysicallyPresent || hasWork) {
    // Good - employee worked despite denial
    result.finalStatus = AttendanceStatus.PRESENT;
    result.hasException = true;
    result.exceptionType = AttendanceException.WORKED_DESPITE_DENIAL;
    result.notes.push("Worked despite leave denial - commendable");
    
  } else {
    // Bad - absent despite denial
    result.finalStatus = AttendanceStatus.ABSENT;
    result.hasException = true;
    result.exceptionType = AttendanceException.ABSENT_DESPITE_DENIAL;
    result.shouldIssuePenalty = true;
    result.notes.push("Absent despite leave denial - unauthorized absence");
  }
  
  return result;
}

/**
 * Process daily attendance for all employees
 */
export async function processDailyAttendance(date: string) {
  // This would be called by a cron job daily
  // 1. Get all employees
  // 2. For each employee, gather their day data
  // 3. Run analysis
  // 4. Update attendance records
  // 5. Create notifications/warnings/penalties as needed
  
  console.log(`Processing attendance for ${date}`);
  
  // Implementation would go here...
}

/**
 * Utility: Get attendance color for calendar display
 */
export function getAttendanceColor(status: AttendanceStatus, hasException: boolean): string {
  if (hasException) {
    return '#FFA500'; // Orange for exceptions
  }
  
  switch (status) {
    case AttendanceStatus.PRESENT:
      return '#22C55E'; // Green
    case AttendanceStatus.LEAVE_APPROVED:
      return '#3B82F6'; // Blue
    case AttendanceStatus.WFH_APPROVED:
      return '#EAB308'; // Yellow
    case AttendanceStatus.ABSENT:
      return '#EF4444'; // Red
    case AttendanceStatus.LATE:
      return '#F97316'; // Orange
    case AttendanceStatus.HALF_DAY:
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Utility: Generate human-readable status message
 */
export function getStatusMessage(analysis: AttendanceAnalysis): string {
  const { finalStatus, hasException, exceptionType, workMinutes } = analysis;
  
  let message = '';
  
  switch (finalStatus) {
    case AttendanceStatus.PRESENT:
      message = `Present${workMinutes > 0 ? ` (${Math.round(workMinutes/60)}h worked)` : ''}`;
      break;
    case AttendanceStatus.LEAVE_APPROVED:
      message = 'On Approved Leave';
      break;
    case AttendanceStatus.WFH_APPROVED:
      message = `Work From Home${workMinutes > 0 ? ` (${Math.round(workMinutes/60)}h worked)` : ''}`;
      break;
    case AttendanceStatus.ABSENT:
      message = 'Absent';
      break;
  }
  
  if (hasException && exceptionType) {
    message += ` - ${getExceptionMessage(exceptionType)}`;
  }
  
  return message;
}

function getExceptionMessage(exceptionType: AttendanceException): string {
  switch (exceptionType) {
    case AttendanceException.WORKED_ON_APPROVED_LEAVE:
      return 'Worked during leave';
    case AttendanceException.NO_WORK_ON_WFH:
      return 'No work activity';
    case AttendanceException.ABSENT_DESPITE_DENIAL:
      return 'Unauthorized absence';
    case AttendanceException.WORKED_DESPITE_DENIAL:
      return 'Worked despite denial';
    case AttendanceException.WORK_WITHOUT_CHECKIN:
      return 'Work without check-in';
    default:
      return 'Exception flagged';
  }
}