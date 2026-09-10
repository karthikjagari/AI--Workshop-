var SHEET_ID = "1qT7Ileqi7KjR8K46DwkfJWliem3yoXoL0ikFuFeQLh8";

var MASTER_TAB = "Form Responses 1";

var HEADERS = [
  "Timestamp",
  "Name",
  "Mobile",
  "School/College Name",
  "School/College Location",
  "Standard",
  "Educational Stream",
  "Available Slot",
  "Source (utm_source)",
  "Medium (utm_medium)",
  "Campaign (utm_campaign)",
  "Landing URL",
  "Pass ID"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: "No registration data received"
      });
    }

    var data = JSON.parse(e.postData.contents);

    // Normalize field values and aliases
    var location = (data.college_location || data.location || data["School/College Location"] || "").toString().trim();
    var stream = (data.educational_stream || data.stream || data["Educational Stream"] || "").toString().trim();
    var college = (data.college || data.college_name || data["School/College Name"] || "").toString().trim();
    var standard = (data.standard || "").toString().trim();
    var slot = (data.available_slot || data.slot || data.available_slots || "").toString().trim();

    data.college_location = location;
    data.location = location;
    data.educational_stream = stream;
    data.stream = stream;
    data.college = college;
    data.standard = standard;
    data.available_slot = slot;

    // Required fields from the registration form (No state, No district)
    var required = [
      "name",
      "mobile",
      "college",
      "college_location",
      "standard",
      "educational_stream",
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

    // Validate and normalize mobile number
    var mobile = data.mobile
      .toString()
      .replace(/\D/g, "");
    if (mobile.length === 11 && mobile.indexOf("0") === 0) {
      mobile = mobile.substring(1);
    } else if (mobile.length === 12 && mobile.indexOf("91") === 0) {
      mobile = mobile.substring(2);
    } else if (mobile.length > 10) {
      mobile = mobile.slice(-10);
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return jsonResponse({
        success: false,
        error: "Invalid mobile number"
      });
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);

    // Master registration sheet
    var master = getOrCreateSheet(ss, MASTER_TAB);

    // Check if mobile number is already registered
    if (isMobileAlreadyRegistered(master, mobile)) {
      return jsonResponse({
        success: false,
        duplicate: true,
        message: "⚠️ You’re Already Registered! This mobile number is already registered for the AI Bootcamp."
      });
    }

    // Generate unique Bootcamp Pass ID only for new registrations
    var passId =
      "BOOTCAMP-" +
      Utilities.getUuid()
        .substring(0, 4)
        .toUpperCase();

    // Normalized record object for safe column mapping
    var rowRecord = {
      timestamp: new Date(),
      name: data.name.toString().trim(),
      mobile: mobile,
      college: college,
      college_location: location,
      location: location,
      address: location,
      standard: standard,
      educational_stream: stream,
      stream: stream,
      available_slot: slot,
      slot: slot,
      utm_source: data.utm_source || "direct",
      utm_medium: data.utm_medium || "direct",
      utm_campaign: data.utm_campaign || "none",
      landing_url: data.landing_url || "",
      passId: passId
    };

    // Master registration sheet write
    var masterRow = buildRowForSheet(master, rowRecord);
    master.appendRow(masterRow);

    // Channel-specific sheet write
    var channel = normalizeChannelName(
      data.utm_source || "direct"
    );

    var channelSheet = getOrCreateSheet(
      ss,
      channel
    );
    var channelRow = buildRowForSheet(channelSheet, rowRecord);
    channelSheet.appendRow(channelRow);

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
  }
}

function buildRowForSheet(sheet, record) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var row = new Array(headers.length);

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i].toString().toLowerCase().trim();
    if (h.indexOf("timestamp") !== -1 || h.indexOf("time") !== -1) {
      row[i] = record.timestamp;
    } else if (h.indexOf("pass") !== -1 || h.indexOf("bootcamp id") !== -1) {
      row[i] = record.passId;
    } else if (h.indexOf("mobile") !== -1 || h.indexOf("phone") !== -1) {
      row[i] = record.mobile;
    } else if (h.indexOf("location") !== -1 || h.indexOf("place") !== -1) {
      row[i] = record.college_location || record.location;
    } else if (h.indexOf("address") !== -1) {
      row[i] = record.address || record.college_location || record.location;
    } else if (h.indexOf("stream") !== -1 || h.indexOf("branch") !== -1) {
      row[i] = record.educational_stream || record.stream;
    } else if (h.indexOf("standard") !== -1 || h.indexOf("class") !== -1 || h.indexOf("grade") !== -1) {
      row[i] = record.standard;
    } else if (h.indexOf("college") !== -1 || h.indexOf("school") !== -1) {
      row[i] = record.college;
    } else if (h.indexOf("slot") !== -1) {
      row[i] = record.available_slot || record.slot;
    } else if (h.indexOf("source") !== -1) {
      row[i] = record.utm_source;
    } else if (h.indexOf("medium") !== -1) {
      row[i] = record.utm_medium;
    } else if (h.indexOf("campaign") !== -1) {
      row[i] = record.utm_campaign;
    } else if (h.indexOf("url") !== -1 || h.indexOf("landing") !== -1) {
      row[i] = record.landing_url;
    } else if (h.indexOf("name") !== -1) {
      row[i] = record.name;
    } else {
      row[i] = "";
    }
  }
  return row;
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

  ensureSheetHeaders(sheet);
  return sheet;
}

function ensureSheetHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return;

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  function findIndex(term) {
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toString().toLowerCase().indexOf(term) !== -1) return i;
    }
    return -1;
  }

  // 1. Ensure "School/College Location" column exists after College Name
  var locIdx = findIndex("location");
  if (locIdx === -1) {
    var collegeIdx = findIndex("college");
    if (collegeIdx === -1) collegeIdx = findIndex("school");
    if (collegeIdx !== -1) {
      sheet.insertColumnAfter(collegeIdx + 1);
      sheet.getRange(1, collegeIdx + 2).setValue("School/College Location").setFontWeight("bold");
    } else {
      sheet.insertColumnAfter(4);
      sheet.getRange(1, 5).setValue("School/College Location").setFontWeight("bold");
    }
    lastCol = sheet.getLastColumn();
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // 2. Ensure "Educational Stream" column exists after Standard
  var streamIdx = findIndex("stream");
  if (streamIdx === -1) {
    var standardIdx = findIndex("standard");
    if (standardIdx !== -1) {
      sheet.insertColumnAfter(standardIdx + 1);
      sheet.getRange(1, standardIdx + 2).setValue("Educational Stream").setFontWeight("bold");
    } else {
      sheet.insertColumnAfter(6);
      sheet.getRange(1, 7).setValue("Educational Stream").setFontWeight("bold");
    }
    lastCol = sheet.getLastColumn();
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // 3. Ensure "Available Slot" column exists
  var slotIdx = findIndex("slot");
  if (slotIdx === -1) {
    var streamColIdx = findIndex("stream");
    if (streamColIdx !== -1) {
      sheet.insertColumnAfter(streamColIdx + 1);
      sheet.getRange(1, streamColIdx + 2).setValue("Available Slot").setFontWeight("bold");
    } else {
      sheet.insertColumnAfter(7);
      sheet.getRange(1, 8).setValue("Available Slot").setFontWeight("bold");
    }
  }
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

function isMobileAlreadyRegistered(sheet, targetMobile) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;

    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return false;

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var mobileCol = -1;

    for (var i = 0; i < headers.length; i++) {
      var h = headers[i].toString().toLowerCase();
      if (h.indexOf("mobile") !== -1 || h.indexOf("phone") !== -1) {
        mobileCol = i + 1;
        break;
      }
    }

    if (mobileCol === -1) mobileCol = 3;

    var mobileValues = sheet.getRange(2, mobileCol, lastRow - 1, 1).getValues();
    var cleanTarget = targetMobile.toString().replace(/\D/g, "");
    if (cleanTarget.length > 10) cleanTarget = cleanTarget.slice(-10);

    for (var r = 0; r < mobileValues.length; r++) {
      var cell = mobileValues[r][0];
      if (cell !== undefined && cell !== null && cell !== "") {
        var cleanCell = cell.toString().replace(/\D/g, "");
        if (cleanCell.length > 10) cleanCell = cleanCell.slice(-10);
        if (cleanCell === cleanTarget && cleanTarget.length === 10) {
          return true;
        }
      }
    }
  } catch (err) {
    Logger.log("Error checking duplicate mobile: " + err.message);
  }
  return false;
}

