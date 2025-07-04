export const defaultpuppeteerLaunchOptions = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
    ],
    headless:false
    // executablePath: '/usr/bin/google-chrome'
}