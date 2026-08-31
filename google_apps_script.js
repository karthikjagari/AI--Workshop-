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

function doPost(e) {
  try {
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
      .replace(/\s+/g, "");

    if (!/^[0-9]{10}$/.test(mobile)) {
      return jsonResponse({
        success: false,
        error: "Invalid mobile number"
      });
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);

    // Generate unique Bootcamp Pass ID
    var passId =
      "BOOTCAMP-" +
      Utilities.getUuid()
        .substring(0, 4)
        .toUpperCase();

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

    // Master registration sheet
    var master = getOrCreateSheet(ss, MASTER_TAB);
    master.appendRow(row);

    // Channel-specific sheet
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
  }
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
