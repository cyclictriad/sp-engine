import { globalState } from "../stores/index";

export default defineEventHandler(async (event) => {
    const credentials = await readValidatedBody(event, body => {
        if (!body.username || !body.password) {
            throw createError({
                status: 400,
                statusMessage: "Bad request",
                message: "Username and password requested",
            })

        }
        return body;

    })

    const { authChanged } = getQuery(event);

    if (globalState.isLoggedIn && !authChanged) {
        return
    }

    if (!globalState.browser) {
        globalState.browser = await launchBrowser({
            headless: false
        })
    }

    if (!globalState.page) {
        globalState.page = await globalState.browser.newPage()
    }


    await globalState.page.goto('https://studypool.com', {
        waitUntil:'domcontentloaded'
    })

    await globalState.page.evaluate((username, password) => {
        const usernameInput = document.querySelector("#UserLogin_username")
        const passwordInput = document.querySelector("#UserLogin_password")
        const loginButton = document.querySelector("#login-button")

        if (!usernameInput || !passwordInput || !loginButton) {
            throw Error()
        }

        usernameInput.value = username
        passwordInput.value = password

        loginButton.click()


    }, credentials.username, credentials.password)

    globalState.isLoggedIn = true

})