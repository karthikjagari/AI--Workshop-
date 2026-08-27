/**
 * ============================================================================
 * NIAT OFFLINE AI WORKSHOP — GOOGLE APPS SCRIPT WEB APP INTEGRATION
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8/edit
 * ============================================================================
 * 
 * Features:
 * 1. Mobile Number Normalization (+91, 91, 0, spaces, dashes)
 * 2. Strict Duplicate Mobile Prevention (returns duplicate message without adding row)
 * 3. Unique Workshop-XXXX Pass ID generation
 * 4. Master Log ("Form Responses 1") + Channel-Specific Tab routing
 * ============================================================================
 */

const SHEET_ID = '1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8';
const MASTER_SHEET_NAME = 'Form Responses 1';

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
  'Landing URL',
  'Pass ID'
];

// Map raw utm_source values (lowercase) to clean channel tab names
const CHANNEL_MAP = {
  'im': 'IM',
  'dm': 'DM',
  'cba': 'CBA',
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
    service: 'NIAT AI Workshop Registration Web App',
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

    // Extract & Validate Fields
    const name = String(data.name || '').trim();
    const rawMobile = String(data.mobile || '').trim();
    const normalizedMobile = normalizeMobile(rawMobile);
    const college = String(data.college || '').trim();
    const address = String(data.address || '').trim();
    const standard = String(data.standard || '').trim();
    const state = String(data.state || '').trim();
    const district = String(data.district || '').trim();
    const questions = String(data.questions || '').trim();

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
      ensureHeaderRow(masterSheet);
    }

    // 2. Strict Duplicate Mobile Check against Master Sheet
    if (isDuplicateMobile(masterSheet, normalizedMobile)) {
      return responseJSON({
        success: false,
        duplicate: true,
        error: 'You have already registered for this AI Bootcamp.',
        detail: 'Your mobile number is already registered.'
      });
    }

    // 3. Generate unique collision-safe Workshop-XXXX ID
    const passId = generateUniquePassId(masterSheet);
    const timestamp = new Date();

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
      data.landing_url || '',
      passId
    ];

    // Append to Master Sheet
    masterSheet.appendRow(rowData);

    // 4. Append to Channel-Specific Tab (auto-created if missing)
    if (channelTabName && channelTabName !== MASTER_SHEET_NAME) {
      let channelSheet = ss.getSheetByName(channelTabName);
      if (!channelSheet) {
        channelSheet = ss.insertSheet(channelTabName);
        channelSheet.appendRow(HEADERS);
        channelSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      } else {
        ensureHeaderRow(channelSheet);
      }
      channelSheet.appendRow(rowData);
    }

    return responseJSON({
      success: true,
      passId: passId,
      name: name,
      channel: channelTabName
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
function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

/**
 * Generate unique collision-checked Workshop-XXXX ID
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
    passId = `Workshop-${code}`;
    attempts++;
  } while (attempts < 100);

  return passId;
}
