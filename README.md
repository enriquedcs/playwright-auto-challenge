<a href="https://github.com/">
   <img alt="Tested with Playwright" src="https://img.shields.io/static/v1?style=for-the-badge&message=Playwright&color=2EAD33&logo=Playwright&logoColor=FFFFFF&label=">
</a>

# QA Automation Technical Challenge
The purpose of this Repo is to solve the following Automation challenge:

1. Automate the Workflow:
Build an automated script using Playwright in Javascript.
The script reads data from an Excel <Name> file and input the data into the corresponding fields on the web page:
https://www.theautomationchallenge.com/.
The fields on the web page will change their location, size, selector, and label position every time the "Submit" button is
clicked. The script dynamically identify and input the correct data into the correct fields for all 50 rows in the Excel file.
2. Handle reCAPTCHA:
The web page may display a random reCAPTCHA pop-up. The script is able to handle this to continue the test without a problem.
3. Login:
The script does a log in before starting the automation.
4. Performance:
The script completes the task with 100% accuracy.
The script finishes in less than 4 minutes.


# How it works

Every single test is located in ./tests folder
Every Page object is located in ./page-objects
Utils are available ./utils

run npm install to install all dependenies

# Launch test

All Tests
npx playwright test

Single Test Solving the challenge
npx playwright test tests/UIChallengetest.spec.js --headed






