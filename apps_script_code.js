function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.html,
      name: data.from || "E-Gaming Store"
    });
    
    return ContentService.createTextOutput(JSON.stringify({"success": true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
