/**
 * Google Apps Script for LRU Property License Map Notes
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1bDW3zUkQIZ-IrmC9MGNqBswBc7Ufd1isiUuMena8jt0/edit
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this script
 * 4. Save the project (name it "Map Notes API")
 * 5. Deploy as web app:
 *    - Click "Deploy" > "New deployment"
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 * 6. Copy the Web App URL and use it in your index.html
 *
 * SPREADSHEET STRUCTURE:
 * Your spreadsheet should have these columns in Sheet1:
 * - Column A: Address
 * - Column B: Name
 * - Column C: Note
 * - Column D: Timestamp
 */

// Handle GET requests - return all notes as JSON
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Sheet1 not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();

    // Skip header row if it exists
    const hasHeader = data.length > 0 &&
                      (data[0][0] === 'Address' || data[0][0] === 'address');
    const startRow = hasHeader ? 1 : 0;

    const notes = [];

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows
      if (!row[0] && !row[1] && !row[2]) continue;

      notes.push({
        address: row[0] || '',
        name: row[1] || '',
        note: row[2] || '',
        timestamp: row[3] || ''
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      notes: notes
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests - add new note
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet1 not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Parse the POST data
    const postData = JSON.parse(e.postData.contents);
    const address = postData.address || '';
    const name = postData.name || '';
    const note = postData.note || '';
    const timestamp = new Date().toISOString();

    // Validate required fields
    if (!address || !name || !note) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields: address, name, and note are required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Check if this is the first entry (add headers if needed)
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(['Address', 'Name', 'Note', 'Timestamp']);
    }

    // Append the new note
    sheet.appendRow([address, name, note, timestamp]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Note added successfully',
      note: {
        address: address,
        name: name,
        note: note,
        timestamp: timestamp
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
