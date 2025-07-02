function doPost(e) {
  try {
    const SPREADSHEET_ID = '1sPZlkOtbbSqhXBj25wM-Wwqd9YzV3RCfTD1w3NFTiZ0';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // Set headers if empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Name', 'Course Path', 'Pre-test Score', 'Post-test Score', 
        'Modules Completed', 'High Score', 'Badges Earned', 'Total Time (seconds)',
        'Improvement Feedback', 'Enjoyment Feedback'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // Parse data with better error handling
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter) {
        data = e.parameter;
      } else {
        throw new Error('No data received');
      }
    } catch (parseError) {
      Logger.log('Parse error: ' + parseError.toString());
      Logger.log('Raw postData: ' + JSON.stringify(e.postData));
      data = {};
    }
    
    // Log incoming data for debugging
    Logger.log('Received data: ' + JSON.stringify(data));
    
    // Prepare row with safe data access
    const row = [
      data.Timestamp || new Date().toISOString(),
      data.Name || '',
      data['Course Path'] || '',
      data['Pre-test Score'] || '',
      data['Post-test Score'] || '',
      data['Modules Completed'] || '',
      parseInt(data['High Score']) || 0,
      data['Badges Earned'] || '',
      parseInt(data['Total Time (seconds)']) || 0,
      data['Improvement Feedback'] || '',
      data['Enjoyment Feedback'] || ''
    ];
    
    // Add the row to the sheet
    sheet.appendRow(row);
    
    // Log success for debugging
    Logger.log('Data saved successfully: ' + JSON.stringify(row));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully',
        rowData: row
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        details: 'Check execution logs for more details'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Google Apps Script is working! POST requests accepted.');
}

// Test function
function testFunction() {
  Logger.log('Script is working correctly');
  try {
    const SPREADSHEET_ID = '1sPZlkOtbbSqhXBj25wM-Wwqd9YzV3RCfTD1w3NFTiZ0';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    Logger.log('Spreadsheet access successful');
    return 'Test successful - can access spreadsheet';
  } catch (error) {
    Logger.log('Test failed: ' + error.toString());
    return 'Test failed: ' + error.toString();
  }
}