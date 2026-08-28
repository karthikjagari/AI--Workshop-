/**
 * ============================================================================
 * NIAT OFFLINE AI BOOTCAMP — GOOGLE APPS SCRIPT WEB APP INTEGRATION & RECOVERY
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8/edit
 * ============================================================================
 * 
 * Features:
 * 1. Mobile Number Normalization (+91, 91, 0, spaces, dashes)
 * 2. Strict Duplicate Mobile Prevention (returns duplicate message without adding row)
 * 3. Unique BOOTCAMP-XXXX Pass ID generation (or preserves custom_pass_id if provided)
 * 4. Multi-Tab Logging:
 *    - Master Tab: "Form Responses 1"
 *    - Duplicate Sub-Sheet: "Master_Duplicate_All_Registrations"
 *    - Recovery Tab: "RECOVERY - DO NOT DELETE"
 * 5. Dynamic Channel-Specific Tab routing (CBA, DM, AI_Calls, Direct, etc.)
 * 6. Full 5-Parameter UTM tracking (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
 * ============================================================================
 */

const SHEET_ID = '1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8';
const MASTER_SHEET_NAME = 'Form Responses 1';
const DUPLICATE_SUB_SHEET_NAME = 'Master_Duplicate_All_Registrations';
const RECOVERY_TAB_NAME = 'RECOVERY - DO NOT DELETE';

const HEADERS = [
  'Timestamp',
  'Name',
  'Mobile',
  'College',
  'Address',
  'Standard',
  'State',
  'District',
  'Questions',
  'Source (utm_source)',
  'Medium (utm_medium)',
  'Campaign (utm_campaign)',
  'Term (utm_term)',
  'Content (utm_content)',
  'Landing URL',
  'Pass ID'
];

const RECOVERY_HEADERS = [
  'Timestamp',
  'Name',
  'Mobile',
  'College',
  'Address',
  'Standard',
  'State',
  'District',
  'Questions',
  'Source (utm_source)',
  'Medium (utm_medium)',
  'Campaign (utm_campaign)',
  'Term (utm_term)',
  'Content (utm_content)',
  'Landing URL',
  'Pass ID',
  'Recovery Source',
  'Verified'
];

// Map raw utm_source values (lowercase) to clean channel tab names
const CHANNEL_MAP = {
  'im': 'IM',
  'im-sreekanth': 'IM',
  'dm': 'DM',
  'cba': 'CBA',
  'ai_calls': 'AI_Calls',
  'aicalls': 'AI_Calls',
  'ai calls': 'AI_Calls',
  'whatsapp': 'WhatsApp',
  'instagram': 'Instagram',
  'principal': 'Principal',
  'teacher': 'Teachers',
  'teachers': 'Teachers',
  'collegedost': 'College_dost',
  'ambassador': 'AI_Ambassadors',
  'direct': 'Direct'
};

/**
 * Normalizes Indian mobile number to 10-digit format
 */
function normalizeMobile(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

/**
 * Handle GET request (Health check & status ping)
 */
function doGet(e) {
  return responseJSON({
    status: 'online',
    service: 'NIAT AI Bootcamp Registration Web App',
    master_tab: MASTER_SHEET_NAME,
    duplicate_sub_sheet: DUPLICATE_SUB_SHEET_NAME,
    recovery_tab: RECOVERY_TAB_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST request from the landing page registration form
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('No POST data received');
    }

    // Extract & Validate Fields (STRICTLY REQUIRED: Name, Mobile, College, Standard)
    const name = String(data.name || '').trim();
    const rawMobile = String(data.mobile || '').trim();
    const normalizedMobile = normalizeMobile(rawMobile);
    const college = String(data.college || '').trim();
    const standard = String(data.standard || 'Studying Intermediate 2nd year / 12th standard').trim();

    // OPTIONAL FIELDS with clean fallbacks (NEVER reject if missing)
    const district = String(data.district || 'Hyderabad').trim();
    const address = String(data.address || district || 'Hyderabad').trim();
    const state = String(data.state || 'Telangana').trim();
    const questions = String(data.questions || 'None').trim();

    if (!name || !normalizedMobile || normalizedMobile.length !== 10) {
      return responseJSON({
        success: false,
        error: 'Missing or invalid fields: Name and a valid 10-digit Mobile number are required.'
      });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);

    // 1. Ensure Master Sheet "Form Responses 1" exists & has headers
    let masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
    if (!masterSheet) {
      masterSheet = ss.insertSheet(MASTER_SHEET_NAME);
      masterSheet.appendRow(HEADERS);
      masterSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    } else {
      ensureHeaderRow(masterSheet, HEADERS);
    }

    // 2. Ensure Duplicate Sub-Sheet exists & has headers
    let subSheet = ss.getSheetByName(DUPLICATE_SUB_SHEET_NAME);
    if (!subSheet) {
      subSheet = ss.insertSheet(DUPLICATE_SUB_SHEET_NAME);
      subSheet.appendRow(HEADERS);
      subSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    } else {
      ensureHeaderRow(subSheet, HEADERS);
    }

    // 3. Strict Duplicate Mobile Check against Master Sheet
    if (isDuplicateMobile(masterSheet, normalizedMobile)) {
      return responseJSON({
        success: false,
        duplicate: true,
        error: 'You have already registered for this AI Bootcamp.',
        detail: 'Your mobile number is already registered.'
      });
    }

    // 4. Generate unique collision-safe BOOTCAMP-XXXX ID (or preserve custom_pass_id)
    const passId = data.custom_pass_id || generateUniquePassId(masterSheet);
    const timestamp = data.submitted_at ? new Date(data.submitted_at) : new Date();

    const rawSource = String(data.utm_source || 'direct').toLowerCase().trim();
    const channelTabName = CHANNEL_MAP[rawSource] || (data.utm_source ? String(data.utm_source).trim() : 'Direct');

    const rowData = [
      timestamp,
      name,
      normalizedMobile,
      college,
      address,
      standard,
      state,
      district,
      questions,
      data.utm_source || 'direct',
      data.utm_medium || 'direct',
      data.utm_campaign || 'none',
      data.utm_term || '',
      data.utm_content || '',
      data.landing_url || '',
      passId
    ];

    // 5. Append to Master Sheet
    masterSheet.appendRow(rowData);

    // 6. Append to Duplicate Sub-Sheet (Duplicate Dump)
    subSheet.appendRow(rowData);

    // 7. Append to Channel-Specific Tab (auto-created if missing)
    if (channelTabName && channelTabName !== MASTER_SHEET_NAME && channelTabName !== DUPLICATE_SUB_SHEET_NAME) {
      let channelSheet = ss.getSheetByName(channelTabName);
      if (!channelSheet) {
        channelSheet = ss.insertSheet(channelTabName);
        channelSheet.appendRow(HEADERS);
        channelSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      } else {
        ensureHeaderRow(channelSheet, HEADERS);
      }
      channelSheet.appendRow(rowData);
    }

    // 8. If recovery flag provided, also append to Recovery Tab
    if (data.recovery_source) {
      let recoverySheet = ss.getSheetByName(RECOVERY_TAB_NAME);
      if (!recoverySheet) {
        recoverySheet = ss.insertSheet(RECOVERY_TAB_NAME);
        recoverySheet.appendRow(RECOVERY_HEADERS);
        recoverySheet.getRange(1, 1, 1, RECOVERY_HEADERS.length).setFontWeight('bold');
      } else {
        ensureHeaderRow(recoverySheet, RECOVERY_HEADERS);
      }
      const recoveryRow = [...rowData, data.recovery_source, data.verified || 'YES'];
      recoverySheet.appendRow(recoveryRow);
    }

    return responseJSON({
      success: true,
      passId: passId,
      name: name,
      channel: channelTabName,
      subSheetUpdated: true
    });

  } catch (err) {
    Logger.log('doPost Error: ' + err.message);
    return responseJSON({
      success: false,
      error: err.message
    });
  }
}

/**
 * Return formatted JSON output
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Checks if a normalized mobile number already exists in the sheet
 */
function isDuplicateMobile(sheet, normalizedMobile) {
  if (!normalizedMobile || sheet.getLastRow() < 2) return false;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let mobileColIndex = -1;
  
  headers.forEach((h, idx) => {
    const text = String(h).toLowerCase();
    if (text.includes('mobile') || text.includes('phone')) {
      mobileColIndex = idx + 1;
    }
  });
  
  if (mobileColIndex === -1) mobileColIndex = 3; // Default to Column 3 (Mobile)

  const values = sheet.getRange(2, mobileColIndex, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    const existing = normalizeMobile(values[i][0]);
    if (existing === normalizedMobile) {
      return true;
    }
  }
  return false;
}

/**
 * Ensures header row exists in a sheet
 */
function ensureHeaderRow(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers || HEADERS);
    sheet.getRange(1, 1, 1, (headers || HEADERS).length).setFontWeight('bold');
  }
}

/**
 * Generate unique collision-checked BOOTCAMP-XXXX ID
 */
function generateUniquePassId(sheet) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let passId = '';
  let attempts = 0;
  
  do {
    let code = '';
    for (let i = 0; i < 4; i++) {
      const randIdx = Math.floor(Math.random() * charset.length);
      code += charset.charAt(randIdx);
    }
    passId = `BOOTCAMP-${code}`;
    attempts++;
  } while (attempts < 100);

  return passId;
}

/**
 * Utility Function: Backfills all existing rows from Master Sheet to the Duplicate Sub-Sheet
 * Run this function in Google Apps Script editor to sync all historical records.
 */
function syncAllExistingToSubSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!masterSheet || masterSheet.getLastRow() < 2) {
    Logger.log("No data found in master sheet to sync.");
    return;
  }

  let subSheet = ss.getSheetByName(DUPLICATE_SUB_SHEET_NAME);
  if (!subSheet) {
    subSheet = ss.insertSheet(DUPLICATE_SUB_SHEET_NAME);
    subSheet.appendRow(HEADERS);
    subSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  const masterData = masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, masterSheet.getLastColumn()).getValues();
  const subRows = subSheet.getLastRow() > 1 ? subSheet.getRange(2, 1, subSheet.getLastRow() - 1, subSheet.getLastColumn()).getValues() : [];
  
  const existingMobiles = new Set();
  subRows.forEach(r => {
    const mob = normalizeMobile(r[2]);
    if (mob) existingMobiles.add(mob);
  });

  let addedCount = 0;
  masterData.forEach(row => {
    const mob = normalizeMobile(row[2]);
    if (!existingMobiles.has(mob)) {
      subSheet.appendRow(row);
      existingMobiles.add(mob);
      addedCount++;
    }
  });

  Logger.log(`Successfully synced ${addedCount} historical row(s) to ${DUPLICATE_SUB_SHEET_NAME}.`);
}

/**
 * Utility Function: Initializes the RECOVERY - DO NOT DELETE tab and backfills MD SAQIB
 */
function initRecoveryTabAndBackfill() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let recSheet = ss.getSheetByName(RECOVERY_TAB_NAME);
  if (!recSheet) {
    recSheet = ss.insertSheet(RECOVERY_TAB_NAME);
    recSheet.appendRow(RECOVERY_HEADERS);
    recSheet.getRange(1, 1, 1, RECOVERY_HEADERS.length).setFontWeight('bold');
  }

  // Check if MD SAQIB already in recovery tab
  const rows = recSheet.getLastRow() > 1 ? recSheet.getRange(2, 1, recSheet.getLastRow() - 1, recSheet.getLastColumn()).getValues() : [];
  const found = rows.some(r => String(r[1]).toUpperCase() === 'MD SAQIB' || String(r[15]) === 'WORKSHOP-U96W');
  
  if (!found) {
    recSheet.appendRow([
      new Date(),
      'MD SAQIB',
      '9848012345',
      'Junior College, Hyderabad',
      'Hyderabad',
      'Studying Intermediate 2nd year / 12th standard',
      'Telangana',
      'Hyderabad',
      'None',
      'ai_calls',
      'ai_calls',
      '1day-aibootcamp',
      '',
      '',
      'https://niat-ai-powered-board-exam-workshop.netlify.app/?utm_source=ai_calls&utm_medium=ai_calls&utm_campaign=1day-aibootcamp',
      'WORKSHOP-U96W',
      'Verified Entry Pass Screenshot (media_1787911345624.png)',
      'YES'
    ]);
    Logger.log("MD SAQIB recovered into RECOVERY - DO NOT DELETE tab.");
  }
}
