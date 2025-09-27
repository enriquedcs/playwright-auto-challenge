class LoginPage{

    constructor(page)
    {
        this.page = page;

        // Locators for opening the modal
        this.signUpOrLoginLink = page.getByText('SIGN UP OR LOGIN')
        this.startButton = page.getByRole('button', { name: 'Start' })

        // Locators within the login modal
        this.orLoginButton = page.getByRole('button', { name: 'OR LOGIN', exact: true })
        this.emailInput = page.getByRole('textbox', { name: 'Email' })
        this.passwordInput = page.getByRole('textbox', { name: 'Password' })
        this.rememberMeCheckbox = page.getByLabel('Remember me')
        this.logInButton = page.getByRole('button', { name: 'LOG IN' })
    }

    async goTo() {
        await this.page.goto('https://www.theautomationchallenge.com/', { waitUntil: 'networkidle' });
    }

    // A method to perform the login action
    async login(email, password) {
        await this.signUpOrLoginLink.click({ timeout: 60000 })
        // Wait for the 'OR LOGIN' button to appear
        await this.emailInput.fill(" ") 
        await this.orLoginButton.waitFor({ state: 'visible', timeout: 5000 }); 
        await this.orLoginButton.click({ force: true }) 
        //Input fields
        await this.emailInput.fill(email, { force: true })
        await this.passwordInput.fill(password, { force: true })
        await this.logInButton.click()
        
        // Adding an Assertion to confirm login was succesful
        //Wait for Log In hides
        await this.logInButton.waitFor({ state: 'hidden', timeout: 15000 })
        //await this.startButton.waitFor({ state: 'visible', timeout: 30000 })
    }
}
module.exports = { LoginPage }
