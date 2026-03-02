function doGet(e) {
  // รับค่า query parameters
  var id = e.parameter.id;
  var round = e.parameter.round || "1";

  // สร้าง JSON response function เพื่อความสะดวกและลดความซ้ำซ้อน
  function createJsonResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
      ContentService.MimeType.JSON,
    );
  }

  // ตรวจสอบว่าใส่ `id` มาหรือไม่
  if (!id) {
    return createJsonResponse({
      success: false,
      message: "กรุณาระบุรหัสนิสิต",
    });
  }

  // กำหนด Sheet ID ตาม Requirement
  var sheetId = "1Jr-Tmpasz400uv7s4f5AXrxsyPaFdy4vRYM-TmqGY_U";
  // ชื่อแท็บชีตแต่ละรอบ: "คำใบ้ที่ 1", "คำใบ้ที่ 2", "คำใบ้ที่ 3"
  var sheetName = "คำใบ้ที่ " + round;
  var sheet = null;

  try {
    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message:
        "ไม่สามารถเข้าถึงฐานข้อมูลได้ (โปรดตรวจสอบ Sheet ID และสิทธิ์การเข้าถึง)",
    });
  }

  if (!sheet) {
    return createJsonResponse({
      success: false,
      message: "ไม่พบแผ่นงานสำหรับรอบที่ " + round + " ใน Google Sheet",
    });
  }

  // ดึงข้อมูลทั้งหมดในแผ่นงาน
  var data = sheet.getDataRange().getValues();
  var searchId = String(id).trim();

  // เริ่มลูปหาจากแถวที่ 2 เป็นต้นไป (วนลูปข้าม Header ในแถวแรก index=0)
  for (var i = 1; i < data.length; i++) {
    // Column B (Index 1) อาจมีรหัสนิสิตหลายคน คั่นด้วย , (เช่น "66030107,66030108")
    var rawIds = String(data[i][1]).trim();
    if (!rawIds) continue;

    // แยกรหัสออกเป็น Array แล้วเช็คทีละตัวว่าตรงกับรหัสที่ค้นหาไหม
    var idList = rawIds.split(",").map(function (s) {
      return s.trim();
    });
    var found = idList.indexOf(searchId) !== -1;

    if (found) {
      // Column C (Index 2) คือชื่อนิสิต
      var name = data[i][2] ? String(data[i][2]).trim() : "";

      // ดึงคำใบ้จาก Column E (Index 4) เสมอ ตามที่ระบุ
      var hint = String(data[i][4] || "").trim();

      // ถ้าไม่มีข้อมูลคำใบ้เลยในช่องนั้น หรือเป็นเครื่องหมายขีด ให้แสดงข้อความ default
      if (!hint || hint === "-") {
        hint = "ยังไม่มีข้อมูลในรอบนี้";
      }

      // คืนค่า JSON ผลลัพธ์กลับไปที่หน้าเว็บ
      return createJsonResponse({
        success: true,
        hint: hint,
        name: name,
      });
    }
  }

  // กรณีไม่พบรหัสนิสิตที่ส่งมาในชีต
  return createJsonResponse({
    success: false,
    message: "ไม่พบรหัสนิสิตในระบบ",
  });
}
