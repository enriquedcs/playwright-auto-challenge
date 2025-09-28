/**
 * Author: Enrique A Decoss
 * File: FillingPage.js
 * Description: Page Object Model for the main challange form automation.
 *              Handles dynamic form field detection, data input, CAPTCHA solvng, error handling,
 *              and challenge navegation for the Automation Challenge website.
 */

class FillingPage{

    constructor(page)
    {
        this.page = page;

        // Locators for the main challenge actions
        this.startButton = page.getByRole('button', { name: 'Start' })
        this.submitButton = page.getByRole('button', { name: 'Submit' })
        this.downloadLink = page.getByRole('link', { name: 'Download Excel Spreadsheet' })
        
        // reCAPTCHA locators with multiple fallback options
        this.captchaIframe = page.locator('iframe[title="reCAPTCHA"]')
        this.captchaIframeAlt = page.locator('iframe[src*="recaptcha"]')
        this.captchaFrameLocator = page.frameLocator('iframe[title="reCAPTCHA"]')
        this.captchaCheckbox = this.captchaFrameLocator.getByRole('checkbox', { name: "I'm not a robot" })
        this.captchaCheckboxAlt = this.captchaFrameLocator.locator('#recaptcha-anchor')
        
        const buttonLocator = page.getByRole('button', { name: 'presentation' })
        this.playerErrorButton = page.getByRole('button', { name: 'Send Error Log' })
        this.roundButton = page.getByRole('button', { name: /Round \d+ of 50/i })
        this.playerErrorElement = page.getByText('Player error')

        // Extra Locator for reference
        this.companyNameLabel = 'Company Name'
        this.challengeContext = page.locator('text=Round')
    }

    // It uses 'this.page' instead of taking 'page' as an argument.
    async findInputByLabel(labelText) {
        // The challenge site uses a simple structure where label text is near input fields
        // Let's use a more direct approach that works with the actual DOM
        
        console.log(`Looking for input field with label: ${labelText}`)
        
        // Strategy 1: Find input by looking for text containers and their associated inputs
        try {
            // Look for any element containing the label text, then find nearby input
            const containers = this.page.locator(`*:has-text("${labelText}")`)
            const containerCount = await containers.count()
            
            for (let i = 0; i < containerCount; i++) {
                const container = containers.nth(i)
                
                // Try to find input inside this container
                const inputInside = container.locator('input, textarea')
                if (await inputInside.count() > 0 && await inputInside.first().isVisible()) {
                    console.log(`Found input inside container for ${labelText}`)
                    return inputInside.first()
                }
                
                // Try to find input as next sibling
                const nextInput = container.locator('xpath=./following-sibling::*//input | ./following-sibling::input')
                if (await nextInput.count() > 0 && await nextInput.first().isVisible()) {
                    console.log(`Found input as sibling for ${labelText}`)
                    return nextInput.first()
                }
                
                // Try to find input in parent container
                const parentContainer = container.locator('xpath=./..')
                const inputInParent = parentContainer.locator('input, textarea').filter({ hasText: '' })
                if (await inputInParent.count() > 0) {
                    for (let j = 0; j < await inputInParent.count(); j++) {
                        const input = inputInParent.nth(j)
                        if (await input.isVisible() && await input.isEnabled()) {
                            console.log(`Found input in parent container for ${labelText}`)
                            return input
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`Strategy 1 failed for ${labelText}:`, error.message)
        }
        
        // Strategy 2: Look for inputs by position/index (since labels are consistent)
        // Map known labels to input positions
        const labelToIndex = {
            'Company Name': 0,
            'Address': 1, 
            'EIN': 2,
            'Sector': 3,
            'Automation Tool': 4,
            'Annual Saving': 5,
            'Date': 6
        }
        
        if (labelToIndex.hasOwnProperty(labelText)) {
            try {
                const allInputs = this.page.locator('input[type="text"], input:not([type]), textarea')
                const inputIndex = labelToIndex[labelText]
                
                if (await allInputs.count() > inputIndex) {
                    const targetInput = allInputs.nth(inputIndex)
                    if (await targetInput.isVisible() && await targetInput.isEnabled()) {
                        console.log(`Found input by index ${inputIndex} for ${labelText}`)
                        return targetInput
                    }
                }
            } catch (error) {
                console.warn(`Strategy 2 failed for ${labelText}:`, error.message)
            }
        }
        
        // Strategy 3: Simple proximity-based search
        try {
            const allVisibleInputs = this.page.locator('input:visible, textarea:visible')
            const inputCount = await allVisibleInputs.count()
            console.log(`Found ${inputCount} visible inputs`)
            
            for (let i = 0; i < inputCount; i++) {
                const input = allVisibleInputs.nth(i)
                
                // Check if the label text appears near this input in the DOM
                const inputParent = input.locator('xpath=./parent::*')
                const hasNearbyLabel = inputParent.locator(`*:has-text("${labelText}")`)
                
                if (await hasNearbyLabel.count() > 0) {
                    console.log(`Found input with nearby label for ${labelText}`)
                    return input
                }
            }
        } catch (error) {
            console.warn(`Strategy 3 failed for ${labelText}:`, error.message)
        }
        
        // Strategy 4: Fallback - just get the first available input and hope for the best
        try {
            const firstAvailableInput = this.page.locator('input:visible, textarea:visible').first()
            if (await firstAvailableInput.isVisible()) {
                console.warn(`Using first available input as fallback for ${labelText}`)
                return firstAvailableInput
            }
        } catch (error) {
            console.error(`All strategies failed for ${labelText}:`, error.message)
        }
        
        throw new Error(`Could not find any suitable input for label: ${labelText}`)
    }

    // Alternative method to fill fields by position instead of by label
    async fillFieldByPosition(position, value) {
        try {
            console.log(`Filling position ${position} with value: ${value}`)
            
            // Get all visible text inputs
            const allInputs = this.page.locator('input:visible, textarea:visible')
            const inputCount = await allInputs.count()
            
            console.log(`Found ${inputCount} visible inputs, targeting position ${position}`)
            
            if (position < inputCount) {
                const targetInput = allInputs.nth(position)
                
                // Wait for input to be ready
                await targetInput.waitFor({ state: 'visible', timeout: 3000 })
                
                // Clear and fill
                await targetInput.click()
                await this.page.keyboard.press('Meta+a') // Select all
                await targetInput.fill(String(value))
                
                console.log(`Successfully filled position ${position}`)
                return true
            } else {
                console.error(`Position ${position} is out of range (only ${inputCount} inputs found)`)
                return false
            }
        } catch (error) {
            console.error(`Failed to fill position ${position}:`, error.message)
            return false
        }
    }

    // Alternative fill method that tries both label-based and position-based approaches
    async fillFieldRobust(fieldLabel, value, position) {
        console.log(`\n=== Filling ${fieldLabel} (position ${position}) with value: ${value} ===`)
        
        // Try position-based first (often more reliable for dynamic forms)
        const positionSuccess = await this.fillFieldByPosition(position, value)
        if (positionSuccess) {
            return
        }
        
        // Fallback to label-based approach
        console.log(`Position-based fill failed, trying label-based for ${fieldLabel}`)
        await this.fill_field(fieldLabel, value)
    }

    // Debug helper method to understand the current form structure
    async debugFormStructure() {
        console.log("=== CURRENT FORM STRUCTURE DEBUG ===")
        
        // Get all visible inputs
        const inputs = this.page.locator('input:visible, textarea:visible, [role="textbox"]:visible')
        const inputCount = await inputs.count()
        console.log(`Found ${inputCount} visible input elements`)
        
        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i)
            const placeholder = await input.getAttribute('placeholder') || 'none'
            const name = await input.getAttribute('name') || 'none'
            const id = await input.getAttribute('id') || 'none'
            const type = await input.getAttribute('type') || 'text'
            const ariaLabel = await input.getAttribute('aria-label') || 'none'
            
            console.log(`Input ${i + 1}: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}, aria-label=${ariaLabel}`)
        }
        
        // Get all text elements that might be labels
        const possibleLabels = this.page.locator('label, span, div, p').filter({ 
            hasText: /Company Name|Address|EIN|Sector|Automation Tool|Annual Saving|Date/i 
        })
        const labelCount = await possibleLabels.count()
        console.log(`Found ${labelCount} potential label elements`)
        
        console.log("=====================================")
    }

    async fill_field(fieldLabel, value) {
        try {
            // Use the more robust findInputByLabel method
            const inputField = await this.findInputByLabel(fieldLabel)
            
            // Wait for element to be ready with shorter timeout
            await inputField.waitFor({ state: 'attached', timeout: 5000 })
            
            // Ensure element is ready for interaction
            if (!(await inputField.isVisible()) || !(await inputField.isEnabled())) {
                throw new Error(`Input field for ${fieldLabel} is not ready for interaction`)
            }
            
            // Robust field clearing with multiple fallback strategies
            try {
                // Strategy 1: Try standard clear()
                await inputField.clear({ timeout: 3000 })
            } catch (clearError) {
                try {
                    // Strategy 2: Select all and delete
                    await inputField.focus({ timeout: 2000 })
                    await this.page.keyboard.press('Meta+a') // Cmd+A on Mac
                    await this.page.keyboard.press('Delete')
                } catch (selectError) {
                    try {
                        // Strategy 3: Triple-click and type (last resort)
                        await inputField.click({ clickCount: 3, timeout: 2000 })
                        await this.page.keyboard.press('Backspace')
                    } catch (tripleClickError) {
                        console.warn(`Could not clear field ${fieldLabel}, proceeding with current content`)
                    }
                }
            }
            
            // Focus and fill with shorter timeouts and fallback
            await inputField.focus({ timeout: 2000 })
            
            try {
                // Strategy 1: Use fill() method with shorter timeout
                await inputField.fill(String(value), { timeout: 3000 })
            } catch (fillError) {
                // Strategy 2: Fallback to typing (more reliable for some fields)
                console.warn(`Fill method failed for ${fieldLabel}, trying type method`)
                await inputField.type(String(value), { delay: 10 })
            }
            
            // Quick verification without blocking if it fails
            try {
                const enteredValue = await inputField.inputValue({ timeout: 1000 })
                if (enteredValue !== String(value)) {
                    console.warn(`Value mismatch for ${fieldLabel}. Expected: ${value}, Got: ${enteredValue}`)
                }
            } catch (verifyError) {
                // If verification fails, just continue - don't block the automation
                console.warn(`Could not verify input value for ${fieldLabel}`)
            }
            
        } catch (error) {
            console.error(`Failed to fill field ${fieldLabel} with value ${value}:`, error.message)
            
            // Try one more time with a simpler approach
            try {
                const fallbackInput = this.page.getByRole('textbox', { name: fieldLabel }).first()
                await fallbackInput.waitFor({ state: 'visible', timeout: 3000 })
                await fallbackInput.click()
                await fallbackInput.fill(String(value))
                console.log(`Successfully filled ${fieldLabel} using fallback method`)
            } catch (fallbackError) {
                console.error(`Both primary and fallback methods failed for ${fieldLabel}`)
                throw new Error(`Unable to fill field ${fieldLabel}: ${fallbackError.message}`)
            }
        }
    }

    // Start Challenge
    async startChallenge() {
        try {
            console.log("🚀 Starting the challenge...")
            
            // Be very specific about which Start button to click
            // Avoid the Round button which resets everything
            const specificStartButton = this.page.locator('button:has-text("Start"):not(:has-text("Round"))')
            
            // Wait for the specific start button (not the round button)
            await specificStartButton.waitFor({ state: 'visible', timeout: 10000 })
            console.log("✅ Found the correct Start button (not Round button)")
            
            // Click the start button
            await specificStartButton.click()
            console.log("✅ Clicked Start button successfully")
            
            // Wait for the challenge to initialize
            await this.page.waitForTimeout(3000)
            await this.page.waitForLoadState('domcontentloaded')
            
            // Verify challenge actually started by looking for input fields (not Round text)
            console.log("🔍 Verifying challenge started...")
            const verificationSelectors = [
                'input[type="text"]:visible',
                'textarea:visible',
                'input:not([type="hidden"]):visible'
            ]
            
            let challengeVerified = false
            for (const selector of verificationSelectors) {
                try {
                    const elements = this.page.locator(selector)
                    const count = await elements.count()
                    if (count > 0) {
                        console.log(`✅ Challenge verified: Found ${count} input fields`)
                        challengeVerified = true
                        break
                    }
                } catch (e) {
                    continue
                }
            }
            
            if (!challengeVerified) {
                console.log("⚠️ Could not verify challenge started with input fields")
            } else {
                console.log("🎉 Challenge successfully started and verified!")
            }
            
        } catch (error) {
            console.error("❌ Error starting challenge:", error.message)
            
            // Try alternative approach - look for any Start button that's not a Round button
            try {
                console.log("🔄 Trying alternative start method...")
                const allStartButtons = this.page.locator('button')
                const count = await allStartButtons.count()
                
                for (let i = 0; i < count; i++) {
                    const button = allStartButtons.nth(i)
                    const text = await button.textContent()
                    
                    if (text && text.toLowerCase().includes('start') && !text.toLowerCase().includes('round')) {
                        console.log(`Found alternative start button: "${text}"`)
                        await button.click()
                        console.log("✅ Clicked alternative start button")
                        break
                    }
                }
            } catch (altError) {
                console.error("❌ Alternative start method also failed:", altError.message)
                throw new Error("Could not start challenge with any method")
            }
        }
    }

    async submitData() {
        const submitButton = this.page.getByRole('button', { name: 'Submit' })
        await submitButton.waitFor({ state: 'attached', timeout: 10000 })
        await submitButton.evaluate(node => node.click())
    }

    async dismissErrorOverlay() {
        // Use a very short timeout to quickly check for player error
        try {
            const isErrorPresent = await this.playerErrorElement.isVisible({ timeout: 200 })
        
            if (isErrorPresent) {
                console.log("⚠️ Player error detected, but NOT clicking round button to avoid reset loop")
                console.log("📝 Player errors are often temporary - continuing with automation...")
                
                // Just wait a moment for the error to potentially resolve itself
                await this.page.waitForTimeout(2000)
                
                // Check if error disappeared on its own
                const stillPresent = await this.playerErrorElement.isVisible({ timeout: 500 })
                
                if (!stillPresent) {
                    console.log("✅ Player error resolved automatically")
                } else {
                    console.log("⏭️ Player error still present but continuing anyway")
                    // Don't reset the challenge - just continue
                }
            }
        } catch (error) {
            // Expected timeout when no error is present - exit quickly
            return
        }
    }

    async checkAndSolveCaptcha() {
        try {
            console.log("🔍 Scanning page for reCAPTCHA...")
            
            // Strategy 1: Wait a moment for page to stabilize
            await this.page.waitForTimeout(1000)
            
            // Strategy 2: Wait for page stabilization
            await this.page.waitForTimeout(1000)
            
            // Strategy 3: Look for ANY element that might be reCAPTCHA
            const possibleCaptchaSelectors = [
                // Standard reCAPTCHA
                'iframe[src*="recaptcha"]',
                'div[class*="recaptcha"]', 
                '[data-sitekey]',
                '.g-recaptcha',
                '#g-recaptcha',
                // Sometimes it's in a div with specific classes
                'div:has-text("I\'m not a robot")',
                // Generic iframe approaches
                'iframe[title*="CAPTCHA" i]',
                'iframe[title*="captcha" i]',
                'iframe'
            ]
            
            let captchaElement = null
            let usedSelector = null
            
            for (const selector of possibleCaptchaSelectors) {
                try {
                    const elements = this.page.locator(selector)
                    const count = await elements.count()
                    
                    if (count > 0) {
                        // Check if any of these elements are actually visible
                        for (let i = 0; i < count; i++) {
                            const element = elements.nth(i)
                            if (await element.isVisible()) {
                                console.log(`✅ Found potential CAPTCHA with selector: ${selector}`)
                                captchaElement = element
                                usedSelector = selector
                                break
                            }
                        }
                        if (captchaElement) break
                    }
                } catch (e) {
                    // Ignore selector errors, continue with next
                    continue
                }
            }
            
            if (!captchaElement) {
                console.log("✅ No reCAPTCHA detected on page")
                return
            }
            
            console.log(`🛑 RECAPTCHA DETECTED using selector: ${usedSelector}`)
            console.log("Attempting to solve reCAPTCHA...")
            
            // Strategy 4: Multiple click approaches for the found element
            const clickMethods = [
                // Method 1: Simple click
                async () => {
                    await captchaElement.click({ timeout: 3000 })
                    console.log("✅ Method 1: Simple click succeeded")
                },
                
                // Method 2: Force click
                async () => {
                    await captchaElement.click({ force: true, timeout: 3000 })
                    console.log("✅ Method 2: Force click succeeded")
                },
                
                // Method 3: Click with position
                async () => {
                    const box = await captchaElement.boundingBox()
                    if (box) {
                        await this.page.mouse.click(box.x + 20, box.y + 20)
                        console.log("✅ Method 3: Coordinate click succeeded")
                    }
                },
                
                // Method 4: Double click
                async () => {
                    await captchaElement.dblclick({ timeout: 3000 })
                    console.log("✅ Method 4: Double click succeeded")
                },
                
                // Method 5: Focus and press Enter
                async () => {
                    await captchaElement.focus()
                    await this.page.keyboard.press('Enter')
                    console.log("✅ Method 5: Focus + Enter succeeded")
                }
            ]
            
            // Try each click method until one works
            for (let i = 0; i < clickMethods.length; i++) {
                try {
                    console.log(`Trying click method ${i + 1}...`)
                    await clickMethods[i]()
                    
                    // Wait for potential CAPTCHA processing
                    await this.page.waitForTimeout(3000)
                    
                    // Check if CAPTCHA disappeared (success indicator)
                    const stillVisible = await captchaElement.isVisible()
                    if (!stillVisible) {
                        console.log(`🎉 reCAPTCHA solved successfully with method ${i + 1}!`)
                        return
                    } else {
                        console.log(`Method ${i + 1} clicked but CAPTCHA still visible`)
                    }
                    
                } catch (error) {
                    console.log(`Method ${i + 1} failed: ${error.message}`)
                    continue
                }
            }
            
            console.log("⚠️ All reCAPTCHA solving methods attempted. Manual intervention may be needed.")
            console.log("⏳ Waiting 5 seconds for potential manual solving...")
            await this.page.waitForTimeout(5000)
            
        } catch (error) {
            console.log("❌ reCAPTCHA handling encountered error:", error.message)
        }
        
        console.log("🔄 Continuing with automation regardless of reCAPTCHA status...")
    }

    // Simplified CAPTCHA method - just pause for manual intervention
    async handleCaptchaSimply() {
        try {
            // Just check if there's any iframe that looks like CAPTCHA
            const captchaIframe = this.page.locator('iframe[src*="recaptcha"], iframe[title*="captcha" i]')
            const count = await captchaIframe.count()
            
            if (count > 0) {
                console.log("🚨 CAPTCHA detected! Pausing for 10 seconds for manual solving...")
                console.log("👆 Please solve the CAPTCHA manually if you see one")
                
                // Just wait and let user solve it manually
                await this.page.waitForTimeout(10000)
                
                console.log("✅ Continuing automation...")
            }
        } catch (error) {
            // Ignore errors and continue
        }
    }

    // Alternative method - just pause and wait for manual CAPTCHA solving
    async waitForManualCaptchaSolving() {
        try {
            // Check if there's any iframe that might be a CAPTCHA
            const iframes = this.page.locator('iframe')
            const iframeCount = await iframes.count()
            
            if (iframeCount > 0) {
                console.log(`Found ${iframeCount} iframe(s) on page - checking for CAPTCHA...`)
                
                for (let i = 0; i < iframeCount; i++) {
                    const iframe = iframes.nth(i)
                    const src = await iframe.getAttribute('src') || ''
                    const title = await iframe.getAttribute('title') || ''
                    
                    if (src.includes('recaptcha') || title.toLowerCase().includes('captcha')) {
                        console.log("🚨 CAPTCHA DETECTED!")
                        console.log("⏸️  PAUSING AUTOMATION - Please solve the CAPTCHA manually")
                        console.log("⏳ Waiting 30 seconds for manual intervention...")
                        console.log("   (The automation will continue automatically)")
                        
                        // Wait 30 seconds for manual solving
                        await this.page.waitForTimeout(30000)
                        
                        console.log("✅ Resuming automation...")
                        return
                    }
                }
            }
        } catch (error) {
            console.log("Error in manual CAPTCHA wait:", error.message)
        }
    }

    // Method to check what's currently on the page
    async checkPageStatus() {
        console.log("📊 Current page status:")
        console.log(`   URL: ${this.page.url()}`)
        
        try {
            const title = await this.page.title()
            console.log(`   Title: ${title}`)
        } catch (e) {
            console.log("   Title: Could not retrieve")
        }
        
        // Check for common elements
        const elementsToCheck = [
            { name: "Start Button", selector: 'button:has-text("Start")' },
            { name: "Submit Button", selector: 'button:has-text("Submit")' },
            { name: "Input Fields", selector: 'input[type="text"], textarea' },
            { name: "Company Name", selector: 'text=Company Name' },
            { name: "Round Text", selector: 'text*=Round' },
            { name: "Any Form", selector: 'form' },
            { name: "Any Button", selector: 'button' }
        ]
        
        for (const element of elementsToCheck) {
            try {
                const count = await this.page.locator(element.selector).count()
                const visible = count > 0 ? await this.page.locator(element.selector).first().isVisible() : false
                console.log(`   ${element.name}: ${count} found, ${visible ? 'visible' : 'not visible'}`)
            } catch (e) {
                console.log(`   ${element.name}: Error checking - ${e.message}`)
            }
        }
    }

    // Alternative method - wait for manual start
    async waitForManualStart() {
        console.log("⏸️ MANUAL START MODE")
        console.log("👆 Please click the START button manually (NOT the Round button)")
        console.log("⏳ Waiting 15 seconds for manual start...")
        console.log("   The automation will continue automatically once you start")
        
        // Wait for manual intervention
        await this.page.waitForTimeout(15000)
        
        // Check if challenge was started manually
        const inputFields = this.page.locator('input:visible, textarea:visible')
        const count = await inputFields.count()
        
        if (count > 0) {
            console.log(`✅ Manual start successful! Found ${count} input fields`)
        } else {
            console.log("⚠️ No input fields found - continuing anyway")
        }
        
        console.log("🔄 Resuming automation...")
    }
}
    
module.exports = { FillingPage }