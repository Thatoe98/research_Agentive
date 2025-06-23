function doPost(e) {
  try {
    // Get the spreadsheet by ID (replace with your actual spreadsheet ID)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    var userData = data.userData;
    
    // Calculate scores
    var preTestScore = userData.pretest ? userData.pretest.filter(x => x.correct).length : 0;
    var postTestScore = userData.posttest ? userData.posttest.filter(x => x.correct).length : 0;
    var courseProgress = ((userData.pretest ? userData.pretest.length : 0) + 
                         (userData.courseQuizAnswers ? userData.courseQuizAnswers.length : 0) + 
                         (userData.posttest ? userData.posttest.length : 0)) / 
                         (10 + 7 + 10) * 100; // Total questions: pretest(10) + course(7) + posttest(10)
    
    // Prepare row data matching your headers
    var rowData = [
      new Date(), // Timestamp
      userData.name || '', // Name
      preTestScore, // Pre-test Score
      postTestScore, // Post-test Score
      Math.round(courseProgress), // Course Progress (%)
      userData.highscore || 0, // High Score
      userData.startTime ? new Date(userData.startTime) : '', // Start Time
      userData.endTime ? new Date(userData.endTime) : '' // End Time
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
                        .setMimeType(ContentService.MimeType.JSON);
                        
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Script is running');
}