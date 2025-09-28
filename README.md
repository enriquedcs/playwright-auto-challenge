<a href="https://github.com/">
   <img alt="Tested with Playwright" src="https://img.shields.io/static/v1?style=for-the-badge&message=Playwright&color=2EAD33&logo=Playwright&logoColor=FFFFFF&label=">
</a>

# QA Automation Technical Challenge
**Author: Enrique A Decoss**

The purpose of this Repo is to solve the following Automation challenge:

1. **Automate the Workflow:**
Build an automated script using Playwright in Javascript.
The script reads data from an Excel file and input the data into the corresponding fields on the web page:
https://www.theautomationchallenge.com/.
The fields on the web page will change their location, size, selector, and label position every time the "Submit" button is
clicked. The script dynamically identify and input the correct data into the correct fields for all 50 rows in the Excel file.

2. **Handle reCAPTCHA:**
The web page may display a random reCAPTCHA pop-up. The script handles this through multiple strategies including automatic detection and manual intervention when needed.

3. **Login:**
The script performs automated login before starting the automation challenge.

4. **Performance:**
The script completes the task with 100% accuracy and finishes in less than 4 minutes.

## Project Structure

### Page Object Model Architecture
```
page-objects/
├── LoginPage.js     # Handles user authentication and login functionality
├── FillingPage.js   # Main challenge automation, form filling, CAPTCHA handling
```

### Test Files
```
tests/
├── UIChallengetest.spec.js   # Main test automation script
├── config.json               # Configuration file with credentials and URLs
```

### Utilities
```
utils/
├── excelReader.js   # Excel file parsing and data extraction utility
```

## Key Features

### Dynamic Form Handling
- **Position-based filling:** Uses input field positions (0-6) for reliable field detection
- **Label-based fallback:** Multiple strategies to find inputs by their labels
- **Robust field clearing:** Multiple approaches to clear existing field data
- **Error recovery:** Continues automation even if individual field filling fails

### reCAPTCHA Management
- **Automatic detection:** Scans for reCAPTCHA iframes and elements
- **Multiple click strategies:** Various approaches to interact with CAPTCHA checkboxes
- **Manual intervention mode:** Pauses automation for manual CAPTCHA solving when automatic methods fail
- **Graceful continuation:** Never stops the main automation flow due to CAPTCHA issues

### Error Handling
- **Player error detection:** Monitors for page errors without triggering resets
- **Challenge restart prevention:** Avoids clicking Round buttons that reset progress
- **Stealth mode:** Uses puppeteer-extra-plugin-stealth for bot detection avoidance

## Setup Instructions

### Prerequisites
```bash
npm install
```

### Configuration
Update `tests/config.json` with your credentials:
```json
{
    "URL1": "https://www.theautomationchallenge.com/",
    "email": "your-email@example.com", 
    "pwd": "your-password"
}
```

## Running Tests

### All Tests
```bash
npx playwright test
```

### Single Test (Challenge Solution)
```bash
npx playwright test tests/UIChallengetest.spec.js --headed
```

## reCAPTCHA Manual Intervention

When reCAPTCHA appears and automatic solving fails:

1. **Automatic Detection:** The script will detect reCAPTCHA presence and attempt multiple solving strategies
2. **Manual Mode:** If automatic solving fails, the script pauses with clear instructions:
   ```
   🚨 CAPTCHA detected! Pausing for 10 seconds for manual solving...
   👆 Please solve the CAPTCHA manually if you see one
   ```
3. **Continuation:** After the pause, automation resumes automatically
4. **Alternative Method:** You can switch to full manual mode by changing the code to use `waitForManualCaptchaSolving()`










