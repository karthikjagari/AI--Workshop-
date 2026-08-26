/**
 * ============================================================================
 * NIAT OFFLINE AI WORKSHOP — GOOGLE APPS SCRIPT INTEGRATION
 * ============================================================================
 * Instructions:
 * 1. Open your Google Sheet linked to the Google Form:
 *    https://docs.google.com/forms/d/e/1FAIpQLSeSSeHoAGLnqiCyKDJikSelyQiEQVtUY-c4Ah4sQtiE7iSjbQ/viewform
 * 2. In Google Sheets, click Extensions > Apps Script.
 * 3. Replace all existing code with this file.
 * 4. Update the LANDING_PAGE_URL below with your actual deployed website URL.
 * 5. Click Triggers (clock icon on the left) > Add Trigger:
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 6. Save and authorize permissions.
 * ============================================================================
 */

const CONFIG = {
  LANDING_PAGE_URL: 'http://localhost:8080/index.html', // Replace with production URL
  PASS_ID_PREFIX: 'Workshop-',
  ID_LENGTH: 4, // Generates Workshop-XXXX (e.g. Workshop-A7K9)
  CHARSET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Unambiguous uppercase alphanumeric
  SHEET_NAME: 'Form Responses 1',
  COLUMN_PASS_ID: 'Pass ID',
  COLUMN_PASS_URL: 'Pass URL',
  COLUMN_STATUS: 'Status'
};

/**
 * Triggered automatically upon each Google Form submission
 */
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Ensure required tracking columns exist
    ensureHeaderColumns(sheet, headers);
    
    const row = e ? e.range.getRow() : sheet.getLastRow();
    const rowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Find Student Name, Email, and Mobile from form responses
    let studentName = 'STUDENT';
    let studentEmail = '';
    
    headers.forEach((header, idx) => {
      const h = String(header).toLowerCase();
      if (h.includes('name') || h.includes('student')) {
        studentName = String(rowValues[idx] || '').trim();
      }
      if (h.includes('email')) {
        studentEmail = String(rowValues[idx] || '').trim();
      }
    });

    if (!studentName) studentName = 'CLASS 12 PARTICIPANT';
    
    // Generate unique collision-safe Workshop-XXXX ID
    const uniquePassId = generateUniquePassId(sheet);
    
    // Construct verified pass URL with encoded parameters
    const passUrl = `${CONFIG.LANDING_PAGE_URL}?registered=true&name=${encodeURIComponent(studentName)}&pass_id=${encodeURIComponent(uniquePassId)}`;
    
    // Save generated Pass ID, Pass URL, and Status into the Sheet
    savePassRecord(sheet, row, uniquePassId, passUrl);
    
    // Send confirmation email with personal pass if email is present
    if (studentEmail && studentEmail.includes('@')) {
      sendPassEmail(studentEmail, studentName, uniquePassId, passUrl);
    }
    
    Logger.log(`Successfully generated pass ${uniquePassId} for ${studentName}`);
  } catch (err) {
    Logger.log(`Error in onFormSubmit: ${err.message}`);
  }
}

/**
 * Generates collision-checked unique Workshop-XXXX ID
 */
function generateUniquePassId(sheet) {
  const existingIds = getExistingPassIds(sheet);
  let passId = '';
  let attempts = 0;
  
  do {
    let code = '';
    for (let i = 0; i < CONFIG.ID_LENGTH; i++) {
      const randIdx = Math.floor(Math.random() * CONFIG.CHARSET.length);
      code += CONFIG.CHARSET.charAt(randIdx);
    }
    passId = `${CONFIG.PASS_ID_PREFIX}${code}`;
    attempts++;
  } while (existingIds.has(passId) && attempts < 100);
  
  return passId;
}

/**
 * Retrieves set of existing Pass IDs from Sheet to prevent collisions
 */
function getExistingPassIds(sheet) {
  const idSet = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return idSet;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const passIdColIndex = headers.indexOf(CONFIG.COLUMN_PASS_ID) + 1;
  
  if (passIdColIndex > 0) {
    const values = sheet.getRange(2, passIdColIndex, lastRow - 1, 1).getValues();
    values.forEach(r => {
      if (r[0]) idSet.add(String(r[0]).trim());
    });
  }
  return idSet;
}

/**
 * Ensures 'Pass ID', 'Pass URL', and 'Status' header columns exist
 */
function ensureHeaderColumns(sheet, headers) {
  const required = [CONFIG.COLUMN_PASS_ID, CONFIG.COLUMN_PASS_URL, CONFIG.COLUMN_STATUS];
  required.forEach(colName => {
    if (!headers.includes(colName)) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(colName).setFontWeight('bold');
    }
  });
}

/**
 * Writes the assigned Pass ID and URL into the row
 */
function savePassRecord(sheet, row, passId, passUrl) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = headers.indexOf(CONFIG.COLUMN_PASS_ID) + 1;
  const urlCol = headers.indexOf(CONFIG.COLUMN_PASS_URL) + 1;
  const statusCol = headers.indexOf(CONFIG.COLUMN_STATUS) + 1;
  
  if (idCol > 0) sheet.getRange(row, idCol).setValue(passId);
  if (urlCol > 0) sheet.getRange(row, urlCol).setValue(passUrl);
  if (statusCol > 0) sheet.getRange(row, statusCol).setValue('CONFIRMED');
}

/**
 * Sends official workshop entry pass email to the student
 */
function sendPassEmail(email, name, passId, passUrl) {
  const subject = `Your Entry Pass: NIAT Offline AI Workshop (${passId})`;
  const body = `Hi ${name},\n\nCongratulations! Your seat for the NIAT Free Offline AI Workshop on 30 August 2026 at Kapil Kavuri Hub (KKH), Hyderabad has been confirmed.\n\nYour Unique Pass ID: ${passId}\n\nView and download your official entry pass here:\n${passUrl}\n\nPlease present this pass at the venue registration desk.\n\nBest regards,\nNIAT Admissions & AI Workshop Team`;
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body
  });
}
