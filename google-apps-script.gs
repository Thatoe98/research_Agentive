function doPost(e) {
  try {
    // Get the spreadsheet by ID or URL
    // Replace 'YOUR_SPREADSHEET_ID' with your actual Google Sheets ID
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
    
    // Set up headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Name', 
        'Pre-test Score',
        'Post-test Score',
        'Modules Completed',
        'High Score',
        'Improvement',
        'Enjoyment'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    let data;
    
    // Handle different types of POST data
    if (e.postData && e.postData.contents) {
      // JSON data from fetch request
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('Parsed JSON data: ' + JSON.stringify(data));
      } catch (jsonError) {
        Logger.log('JSON parse error: ' + jsonError.toString());
        // Try to parse as form data
        data = e.parameter;
      }
    } else {
      // Form data
      data = e.parameter;
      Logger.log('Form data: ' + JSON.stringify(data));
    }
    
    // Extract values in the correct order
    const row = [
      data.Timestamp || new Date().toISOString(),
      data.Name || '',
      data['Pre-test Score'] || '',
      data['Post-test Score'] || '',
      data['Modules Completed'] || '',
      data['High Score'] || '',
      data.Improvement || '',
      data.Enjoyment || ''
    ];
    
    Logger.log('Row data to insert: ' + JSON.stringify(row));
    
    // Append the row to the sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests for testing
  return ContentService
    .createTextOutput('Google Apps Script is working! Use POST to submit data.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function to verify the script works
function testFunction() {
  Logger.log('Script is working correctly');
  return 'Test successful';
}