/**
 * Google Apps Script for VitaForge Investor Form
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code there and paste this code.
 * 4. Run the 'setup' function once (select 'setup' from the dropdown and click Run) to create headers.
 *    - You will need to review and grant permissions.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 * 7. Set "Execute as": "Me" (your email).
 * 8. Set "Who has access": "Anyone" (IMPORTANT).
 * 9. Click "Deploy".
 * 10. Copy the "Web App URL" and paste it into your Investors.jsx file.
 */

function setup() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Create headers if they don't exist
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Interest", "Name", "Email", "Message"]);
        // Freeze the first row
        sheet.setFrozenRows(1);
        // Bold the headers
        sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000); // Wait up to 10s for concurrent access

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // We expect the data to be sent as JSON string in the body
        // Using text/plain content-type from frontend avoids CORS preflight checks
        var data = JSON.parse(e.postData.contents);

        sheet.appendRow([
            new Date(),
            data.interest,
            data.name,
            data.email,
            data.message
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
