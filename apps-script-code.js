// Apps Script Code for TFWW Website Submissions
// Deploy this as a Web App with Execute as: Me, Access: Anyone

const SHEET_ID = "1batVITcT526zxkc8Qdf0_AKbORnrLRB7-wHdDKhcm9M";
const SHEET_NAME = "Website Submissions";
const NOTIFY_EMAIL = "dylan@thefreewebsitewizards.com";

function clean(v) {
  v = (v || "").toString().trim();
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  try {
    console.log("=== doPost called ===");
    
    // Safely log the request object
    try {
      console.log("Request object keys:", Object.keys(e || {}));
      if (e && e.parameter) {
        console.log("e.parameter keys:", Object.keys(e.parameter));
      }
      if (e && e.postData) {
        console.log("e.postData exists, type:", typeof e.postData);
      }
    } catch (logErr) {
      console.log("Error logging request details:", logErr.message);
    }
    
    let data = null;
    
    // Primary method: Handle FormData (form-encoded) submissions
    if (e && e.parameter && typeof e.parameter === 'object' && Object.keys(e.parameter).length > 0) {
      console.log("Processing FormData submission");
      data = e.parameter;
    } 
    // Fallback: Handle JSON submissions
    else if (e && e.postData && typeof e.postData === 'object') {
      const pd = e.postData;
      const pdType = (pd.type || "").toLowerCase();
      console.log("postData.type:", pdType);
      const contents = pd.contents || "";
      if (!contents) {
        console.log("postData.contents is empty");
      }
      try {
        if (pdType.includes('application/json')) {
          if (!contents) throw new Error('Empty JSON body');
          data = JSON.parse(contents);
          console.log("Parsed JSON body");
        } else if (pdType.includes('application/x-www-form-urlencoded')) {
          const parsed = {};
          contents.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (!k) return;
            const key = decodeURIComponent(k);
            const val = decodeURIComponent((v || '').replace(/\+/g, ' '));
            parsed[key] = val;
          });
          data = parsed;
          console.log("Parsed urlencoded body");
        } else if (pdType.includes('multipart/form-data')) {
          const parsed = {};
          contents.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (!k) return;
            const key = decodeURIComponent(k);
            const val = decodeURIComponent((v || '').replace(/\+/g, ' '));
            parsed[key] = val;
          });
          if (Object.keys(parsed).length > 0) {
            data = parsed;
            console.log("Parsed multipart as urlencoded fallback");
          }
        } else {
          console.log("Unknown postData.type; relying on e.parameter if present");
        }
      } catch (parseErr) {
        console.error("Failed to parse body:", parseErr && parseErr.message);
        return respond({ success: false, error: "Invalid request body" }, 400);
      }
    }
    
    // Check if we got any data
    if (!data) {
      console.error("No valid data received in request");
      return respond({ success: false, error: "No data received" }, 400);
    }
    
    console.log("Parsed data:", data);
    
    // Verify shared secret
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('FORM_SECRET');
    if (expectedSecret) {
      const providedSecret = data.secret;
      if (!providedSecret || providedSecret !== expectedSecret) {
        console.error("Invalid or missing secret");
        return respond({ success: false, error: "Unauthorized" }, 401);
      }
      console.log("Secret verification passed");
    } else {
      console.log("No secret configured, skipping verification");
    }
    
    // Validate required fields
    if (!data.firstName || !data.email || !data.websiteDescription) {
      console.error("Missing required fields:", { 
        firstName: !!data.firstName, 
        email: !!data.email, 
        websiteDescription: !!data.websiteDescription 
      });
      return respond({ success: false, error: "Missing required fields: firstName, email, websiteDescription" }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error("Invalid email format:", data.email);
      return respond({ success: false, error: "Invalid email format" }, 400);
    }

    console.log("Opening spreadsheet with ID:", SHEET_ID);
    let ss;
    try {
      ss = getOrCreateSubmissionSheet();
    } catch (sheetErr) {
      console.error("Failed to open spreadsheet:", sheetErr);
      return respond({ success: false, error: "Configuration error: cannot access spreadsheet" }, 500);
    }

    const ts = data.timestamp ? new Date(data.timestamp) : new Date();
    console.log("Preparing to append row at:", ts);

    // Prepare row data with all fields
    const row = [
      ts,
      clean(data.firstName),
      clean(data.email),
      clean(data.phoneNumber) || "",
      clean(data.countryCode) || "",
      clean(data.countryName) || "",
      clean(data.hasWebHosting) || "",
      "", // websiteName placeholder
      clean(data.websiteDescription),
      clean(data.source) || "tfww-wizard"
    ];

    // Add row to spreadsheet using setValues for reliability
    try {
      const nextRow = ss.getLastRow() + 1;
      ss.getRange(nextRow, 1, 1, row.length).setValues([row]);
      SpreadsheetApp.flush();
      console.log("Data added to spreadsheet successfully at row:", nextRow, "on sheet:", ss.getName());
    } catch (appendErr) {
      console.error("Failed to append row to sheet:", appendErr);
      return respond({ success: false, error: "Failed to save submission" }, 500);
    }

    // Send notification email to owner
    const subject = `🚀 New Website Application from ${clean(data.firstName)}`;
    const ownerEmailBody = `
      <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#9333EA,#7C3AED);padding:20px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:24px">🪄 New Website Application</h1>
        </div>
        <div style="padding:20px;background:#f9f9f9">
          <h2 style="color:#9333EA;margin-top:0">Application Details</h2>
          <div style="background:#fff;padding:20px;border-radius:8px;border-left:4px solid #9333EA">
            <p><strong>Name:</strong> ${clean(data.firstName)}</p>
            <p><strong>Email:</strong> ${clean(data.email)}</p>
            <p><strong>Phone:</strong> ${clean(data.countryCode)} ${clean(data.phoneNumber)}</p>
            <p><strong>Country:</strong> ${clean(data.countryName)}</p>
            <p><strong>Has Web Hosting:</strong> ${clean(data.hasWebHosting)}</p>
            <p><strong>Source:</strong> ${clean(data.source)}</p>
            <p><strong>Project Description:</strong><br>${clean(data.websiteDescription)}</p>
            <p><strong>Submitted:</strong> ${ts.toLocaleString()}</p>
          </div>
          <div style="text-align:center;margin:20px 0">
            <a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}" style="background:#9333EA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">View in Google Sheets</a>
          </div>
        </div>
      </body></html>`;
    
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: subject,
        htmlBody: ownerEmailBody
      });
      console.log("Owner notification email sent successfully");
    } catch (emailErr) {
      console.error("Failed to send owner notification:", emailErr);
      // Don't fail the entire request if owner email fails
    }

    // Send confirmation email to applicant
    const cSubj = `✨ Thanks ${clean(data.firstName)}! Your Free Website Application is Received`;
    const cHtml = `
      <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#9333EA,#7C3AED);padding:30px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:28px">🪄 The Free Website Wizards</h1>
          <p style="margin:10px 0 0;font-size:16px">Your magical website journey begins!</p>
        </div>
        <div style="padding:30px;background:#f9f9f9">
          <h2 style="color:#9333EA;margin-top:0">Hi ${clean(data.firstName)}! 👋</h2>
          <p style="font-size:16px">Thank you for applying for your free website! We've received your application and are excited to help bring your vision to life.</p>
          
          <div style="background:#fff;padding:20px;border-radius:8px;border-left:4px solid #9333EA;margin:20px 0">
            <h3 style="margin-top:0;color:#9333EA">📋 Your Application Summary</h3>
            <p><strong>Email:</strong> ${clean(data.email)}</p>
            <p><strong>Phone:</strong> ${clean(data.countryCode)} ${clean(data.phoneNumber)}</p>
            <p><strong>Project Description:</strong><br>${clean(data.websiteDescription)}</p>
            <p><strong>Submitted:</strong> ${ts.toLocaleDateString()} at ${ts.toLocaleTimeString()}</p>
          </div>
          
          <div style="background:#e0f2fe;padding:20px;border-radius:8px;margin:20px 0">
            <h3 style="margin-top:0;color:#0277bd">🚀 What Happens Next?</h3>
            <ul style="margin:0;padding-left:20px">
              <li><strong>Review:</strong> We'll review your application within 24 hours</li>
              <li><strong>Contact:</strong> Our team will reach out to discuss your project</li>
              <li><strong>Development:</strong> Typical turnaround is 3-5 business days</li>
              <li><strong>Launch:</strong> Your free website will be ready to go live!</li>
            </ul>
          </div>
          
          <div style="text-align:center;margin:30px 0">
            <a href="https://thefreewebsitewizards.com" style="background:#9333EA;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold">Visit Our Website</a>
          </div>
          
          <div style="background:#fff3cd;padding:15px;border-radius:8px;border-left:4px solid #ffc107;margin:20px 0">
            <p style="margin:0;color:#856404"><strong>💡 Pro Tip:</strong> Keep an eye on your email (including spam folder) for updates from our team!</p>
          </div>
          
          <p style="color:#666;font-size:14px;text-align:center">Questions? Reply to this email or contact <a href="mailto:support@thefreewebsitewizards.com" style="color:#9333EA">support@thefreewebsitewizards.com</a></p>
        </div>
      </body></html>`;
    
    if (data.email) {
      try {
        MailApp.sendEmail({
          to: clean(data.email),
          subject: cSubj,
          htmlBody: cHtml
        });
        console.log("Applicant confirmation email sent successfully");
      } catch (emailErr) {
        console.error("Failed to send applicant confirmation:", emailErr);
        // Don't fail the entire request if applicant email fails
      }
    }

    return respond({ success: true, message: "Application submitted successfully! Check your email for confirmation.", applicantEmailAttempted: !!data.email });
  } catch (err) {
    console.error("doPost error:", err);
    
    // Log the error to the Submission Errors sheet for debugging
    try {
      logError(err, e);
    } catch (logErr) {
      console.error("Failed to log error:", logErr);
    }
    
    return respond({ success: false, error: "Internal server error. Please try again." }, 500);
  }
}

function doGet() {
  return respond({ ok: true });
}

function respond(obj, code) {
  // Some Apps Script environments do not support setResponseCode on TextOutput.
  // Return JSON with default 200 and convey status within the payload if needed.
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logError(error, payload) {
  try {
    console.log("Logging error to Submission Errors sheet");
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let errorSheet = spreadsheet.getSheetByName("Submission Errors");
    
    // Create the error sheet if it doesn't exist
    if (!errorSheet) {
      console.log("Creating Submission Errors sheet");
      errorSheet = spreadsheet.insertSheet("Submission Errors");
      errorSheet.appendRow([
        "Timestamp",
        "Error Message",
        "Error Stack",
        "Payload",
        "User Agent",
        "IP Address"
      ]);
    }
    
    const timestamp = new Date();
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || "No stack trace available";
    const payloadStr = JSON.stringify(payload || {});
    
    errorSheet.appendRow([
      timestamp,
      errorMessage,
      errorStack,
      payloadStr,
      "", // User agent not available in Apps Script
      ""  // IP address not available in Apps Script
    ]);
    
    console.log("Error logged successfully");
  } catch (logErr) {
    console.error("Failed to log error to sheet:", logErr);
    // Don't throw here to avoid infinite loops
  }
}

function getOrCreateSubmissionSheet() {
  console.log("Resolving submission sheet by name:", SHEET_NAME);
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let ss = spreadsheet.getSheetByName(SHEET_NAME);
  if (!ss) {
    console.log("Sheet not found, creating:", SHEET_NAME);
    ss = spreadsheet.insertSheet(SHEET_NAME);
  }
  const expectedHeaders = [
    "Timestamp",
    "First Name",
    "Email",
    "Phone Number",
    "Country Code",
    "Country Name",
    "Has Web Hosting",
    "Website Name",
    "Website Description",
    "Source"
  ];
  if (ss.getLastRow() === 0) {
    console.log("Sheet empty; writing headers");
    ss.appendRow(expectedHeaders);
  } else {
    try {
      const headerRange = ss.getRange(1, 1, 1, expectedHeaders.length);
      const existingHeaders = headerRange.getValues()[0].map(v => (v || "").toString().trim());
      const headersMatch = expectedHeaders.every((h, i) => existingHeaders[i] === h);
      if (!headersMatch) {
        console.warn("Header mismatch detected; proceeding without modifying existing headers.", existingHeaders);
      }
    } catch (hdrErr) {
      console.warn("Unable to verify headers:", hdrErr && hdrErr.message);
    }
  }
  return ss;
}

// Helper function to set up the shared secret (run this once manually)
function setupSharedSecret() {
  PropertiesService.getScriptProperties().setProperty('FORM_SECRET', 'tfww-secure-2024');
  console.log('Shared secret has been set up successfully');
}