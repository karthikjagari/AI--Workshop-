var SHEET_ID = "1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8";

var MASTER_TAB = "Form Responses 1";

var HEADERS = [
  "Timestamp",
  "Name",
  "Mobile",
  "School/College Name",
  "Standard",
  "Available Slot",
  "Source (utm_source)",
  "Medium (utm_medium)",
  "Campaign (utm_campaign)",
  "Landing URL",
  "Pass ID"
];

function doGet(e) {
  return jsonResponse({
    status: "active",
    message: "NIAT AI Workshop Registration Endpoint is Live"
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire script lock (up to 30s wait) to prevent concurrent duplicate ID creation
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: "No registration data received"
      });
    }

    var data = JSON.parse(e.postData.contents);

    // Required fields from the registration form
    var required = [
      "name",
      "mobile",
      "college",
      "standard",
      "available_slot"
    ];

    for (var i = 0; i < required.length; i++) {
      var field = required[i];
      if (
        !data[field] ||
        data[field].toString().trim() === ""
      ) {
        return jsonResponse({
          success: false,
          error: "Missing field: " + field
        });
      }
    }

    // Validate mobile number
    var mobile = data.mobile
      .toString()
      .replace(/\D/g, "")
      .slice(-10);

    if (!/^[0-9]{10}$/.test(mobile)) {
      return jsonResponse({
        success: false,
        error: "Invalid mobile number"
      });
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);

    // Master registration sheet
    var master = getOrCreateSheet(ss, MASTER_TAB);

    // Generate next sequential ID or reuse existing ID based on mobile number
    var passId = getOrGenerateBootcampId(master, mobile);

    // Registration row matching HEADERS order
    var row = [
      new Date(),
      data.name.toString().trim(),
      mobile,
      data.college.toString().trim(),
      data.standard.toString().trim(),
      data.available_slot.toString().trim(),
      data.utm_source || "direct",
      data.utm_medium || "direct",
      data.utm_campaign || "none",
      data.landing_url || "",
      passId
    ];

    // Master registration sheet write
    master.appendRow(row);

    // Channel-specific sheet write
    var channel = normalizeChannelName(
      data.utm_source || "direct"
    );

    var channelSheet = getOrCreateSheet(
      ss,
      channel
    );
    channelSheet.appendRow(row);

    // Return success only after both Sheet writes succeed
    return jsonResponse({
      success: true,
      passId: passId
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message
    });
  } finally {
    // Release script lock
    lock.releaseLock();
  }
}

/**
 * Gets existing Bootcamp ID for a duplicate mobile, or generates next sequential ID for a new mobile.
 */
function getOrGenerateBootcampId(sheet, targetMobile) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return "BOOTCAMP-0001";
  }

  var numCols = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];

  // Identify column indices (0-based) for Mobile and Pass ID
  var mobileColIdx = -1;
  var passIdColIdx = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = headers[c].toString().toLowerCase().trim();
    if (mobileColIdx === -1 && (h.indexOf("mobile") !== -1 || h.indexOf("phone") !== -1)) {
      mobileColIdx = c;
    }
    if (passIdColIdx === -1 && (h.indexOf("pass id") !== -1 || h.indexOf("bootcamp id") !== -1 || h.indexOf("pass_id") !== -1)) {
      passIdColIdx = c;
    }
  }

  if (mobileColIdx === -1) mobileColIdx = 2; // Column 3 (Col C) fallback
  if (passIdColIdx === -1) passIdColIdx = headers.length - 1; // Last column fallback

  // Read all existing rows from Row 2 downwards
  var dataRange = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  var normalizedTarget = targetMobile.toString().replace(/\D/g, "").slice(-10);

  var existingIdForMobile = null;
  var maxSequenceNumber = 0;

  for (var r = 0; r < dataRange.length; r++) {
    var rowData = dataRange[r];
    var rowMobile = rowData[mobileColIdx] ? rowData[mobileColIdx].toString().replace(/\D/g, "").slice(-10) : "";
    var rowPassId = rowData[passIdColIdx] ? rowData[passIdColIdx].toString().trim() : "";

    // Check if mobile matches target -> record its assigned Pass ID
    if (rowMobile && rowMobile === normalizedTarget && rowPassId && !existingIdForMobile) {
      existingIdForMobile = rowPassId;
    }

    // Check if Pass ID is sequential numeric (e.g. BOOTCAMP-0001, BOOTCAMP-0042)
    var match = rowPassId.match(/^BOOTCAMP-(\d+)$/i);
    if (match) {
      var seqNum = parseInt(match[1], 10);
      if (!isNaN(seqNum) && seqNum > maxSequenceNumber) {
        maxSequenceNumber = seqNum;
      }
    }
  }

  // RULE 2: If mobile number already exists, reuse the exact same Bootcamp ID
  if (existingIdForMobile) {
    return existingIdForMobile;
  }

  // RULE 1: If new mobile number, generate next sequential ID
  var nextSeq = maxSequenceNumber + 1;
  return formatBootcampId(nextSeq);
}

function formatBootcampId(seqNumber) {
  var numStr = seqNumber.toString();
  while (numStr.length < 4) {
    numStr = "0" + numStr;
  }
  return "BOOTCAMP-" + numStr;
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return sheet;
  }

  // Auto-insert "Available Slot" column in Row 1 if missing from existing sheet
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var hasSlot = headers.some(function(h) {
    return h.toString().toLowerCase().indexOf("slot") !== -1;
  });

  if (!hasSlot) {
    var standardIdx = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toString().toLowerCase().indexOf("standard") !== -1) {
        standardIdx = i;
        break;
      }
    }
    if (standardIdx !== -1) {
      sheet.insertColumnAfter(standardIdx + 1);
      sheet.getRange(1, standardIdx + 2).setValue("Available Slot").setFontWeight("bold");
    } else {
      sheet.insertColumnAfter(5);
      sheet.getRange(1, 6).setValue("Available Slot").setFontWeight("bold");
    }
  }

  return sheet;
}

function normalizeChannelName(raw) {
  var map = {
    "im": "IM",
    "dm": "DM",
    "cba_call": "CBA",
    "cba": "CBA",
    "whatsapp": "WhatsApp",
    "instagram": "Instagram",
    "principal": "Principal",
    "teacher": "Teachers",
    "collegedost": "College_dost",
    "ambassador": "AI_Ambassadors",
    "ai_calls": "AI_Calls",
    "direct": "Direct"
  };

  var key = raw
    .toString()
    .toLowerCase()
    .trim();

  return map[key] ||
    raw.toString().trim();
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
