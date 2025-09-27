
const { chromium } = require('playwright-extra'); 
const stealth = require('puppeteer-extra-plugin-stealth')()

const { LoginPage } = require('../page-objects/LoginPage');
const { FillingPage } = require('../page-objects/FillingPage');
const { readData } = require('../utils/excelReader') 
const { test, expect } = require('@playwright/test')
const path = require('path')
const config = require('./config.json')

// Stealth plugin 
chromium.use(stealth)



//Bot Detection passthrough Obsolote REMOVE LATER
test.use({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.0 Safari 537.36 Secret/<MY_SECRET>' })

test('The Automation Challenge (Stealth Mode)', async () =>
{
    let browser
    let page



    try {
        // 1. Launch a stealthy Chromium browser instance
        browser = await chromium.launch({ 
            headless: false, // Keep headless=false for debugging
            slowMo: 100, // Adds 100ms delay
            // Optional: Set a clean, realistic User-Agent here to help
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
        
        // 2. Create a new page from the stealthy browser
        page = await browser.newPage()
    
        
        // Define credentials
        const email = config.email
        const pwd = config.pwd
        
        //Page Objects
        const loginPage = new LoginPage(page)
        const fillingPage = new FillingPage(page)

        //Load Data from Excel File
        const excelPath = path.join(__dirname, '..', 'challenge.xlsx')
        // Call the imported utility function
        const challengeData = readData(excelPath) 

        //All async methods 
        await loginPage.goTo() 
        await loginPage.login(email, pwd) 
        
        //Start the Challenge Timer
        await fillingPage.startChallenge()

        await fillingPage.checkAndSolveCaptcha()
        await fillingPage.dismissErrorOverlay()

        // Wait for unique Round
        await fillingPage.challengeContext.waitFor({ state: 'visible', timeout: 20000 })

        //const firstField = page.getByRole('textbox', { name: "Company Name" }).first();
        //await firstField.waitFor({ state: 'attached', timeout: 15000 })

        //Automation Loop (The Core Logic)
        let rowNumber = 1

        // Define the expected field labels from the Excel column headers
        // These labels MUST match the column headers in your challenge.xlsx file.
        const labels = [
            "Company Name", "Address", "EIN", 
            "Sector", "Automation Tool", "Annual Saving", "Date"
        ]

        //Core Logic - Iterate 50 times
        for (const record of challengeData) {
            
            if (page.isClosed() || await page.locator('text=Access to this content has been restricted.').isVisible()) {
                console.error("Challenge stopped: Page closed or Anti-Bot block detected.");
                break; // Exit the loop gracefully
            }

            //To avoid Captcha
            await fillingPage.checkAndSolveCaptcha()
            await fillingPage.dismissErrorOverlay()

            console.log(`Processing Row ${rowNumber} of ${challengeData.length}`)

            // Loop through the known labels for the current record
            //for (const label of labels) {
            for (let i = 0; i < 50; i++) {    
                //const value = record[label]
                
                // Check for valid data before filling
                //if (value !== undefined && value !== null) {
                //    // Fills the dynamic field using the static label
                //    await fillingPage.fill_field(label, String(value))
                //}
            }
        
            // Click Submit to process the row and trigger the field changes
            await fillingPage.submitData()

            

            rowNumber++;
        
        }

        // Check for the successful completion message or elements like the Leaderboard
        await expect(page.locator('text=Score 100% accuracy')).toBeVisible({ timeout: 60000 })
    
    } catch (error) {
        console.error("Test failed in stealth mode:", error);
        throw error;
    } finally {
        // Browser is closed
        if (browser) {
            await browser.close()
        }
    }   
}
)


