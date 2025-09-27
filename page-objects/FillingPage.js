class FillingPage{

    constructor(page)
    {
        this.page = page;

        // Locators for the main challenge actions
        this.startButton = page.getByRole('button', { name: 'Start' })
        this.submitButton = page.getByRole('button', { name: 'Submit' })
        this.downloadLink = page.getByRole('link', { name: 'Download Excel Spreadsheet' })
        this.captchaIframe = page.frameLocator('iframe[title="reCAPTCHA"]')
        this.captchaCheckbox = this.captchaIframe.getByRole('checkbox', { name: "I'm not a robot" })

        // Extra Locator for reference
        this.companyNameLabel = 'Company Name'
        this.challengeContext = page.locator('text=Round')
    }

    // It uses 'this.page' instead of taking 'page' as an argument.
    async findInputByLabel(labelText) {
        // 1. Primary Strategy: Playwright's Built-in Semantic Locator
        const primaryLocator = this.page.getByRole('textbox', { name: labelText });
        
        try {
            // Wait for the primary locator to be ATTACHED (ignoring visibility)
            await primaryLocator.first().waitFor({ state: 'attached', timeout: 5000 });
            return primaryLocator.first();
        } catch (e) {
            // Fallback continues below
        }
    
        // Use standard Playwright locator(':has-text()') or text locator.
        const labelContainer = this.page.locator(`:text("${labelText}")`).first(); 
        
        // Try to find the input inside the text container
        const insideInput = labelContainer.locator('input, textarea, [role="textbox"]');
        if (await insideInput.count() > 0) {
            return insideInput.first();
        }
        
        // Robust Sibling/Descendant Search 
        const siblingInput = labelContainer.locator('xpath=./following-sibling::input | ./following-sibling::textarea | ./following-sibling::*[@role="textbox"]');
        if (await siblingInput.count() > 0) {
            return siblingInput.first();
        }
        
        // Search the entire DOM for an input near the label text.
        const finalFallback = this.page.locator('input, textarea, [role="textbox"]').filter({ hasText: labelText });
        if (await finalFallback.count() > 0) {
            return finalFallback.first();
        }
    
        // Return the primary locator as a last resort.
        return primaryLocator.first();
    }

    async fill_field(fieldLabel, value) {
        const input = await this.findInputByLabel(fieldLabel)
        await input.waitFor({ state: 'visible', timeout: 15000 })
        await this.page.waitForFunction(el => el && document.contains(el) && !el.disabled, input)
        await input.focus()
        await input.fill('')
        await input.type(String(value), { delay: 10 })
        await this.page.waitForTimeout(120)
    }

    // ... (rest of your methods remain the same) ...
    async startChallenge() {
        await this.startButton.waitFor({ state: 'visible', timeout: 10000 }) 
        await this.startButton.focus()
        await this.page.keyboard.press('Enter')
        await this.page.waitForLoadState('networkidle')
    }

    async submitData() {
        const submitButton = this.page.getByRole('button', { name: 'Submit' })
        await submitButton.waitFor({ state: 'attached', timeout: 10000 })
        await submitButton.evaluate(node => node.click())
    }

    async checkAndSolveCaptcha() {
        // ... (checkAndSolveCaptcha method remains the same) ...
    }
}
module.exports = { FillingPage }