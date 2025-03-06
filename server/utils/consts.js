export const defaultpuppeteerLaunchOptions = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
    ],
    executablePath: '/usr/bin/google-chrome'
}