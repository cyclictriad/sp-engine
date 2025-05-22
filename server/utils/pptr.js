import puppeteer from "puppeteer";
import { defaultpuppeteerLaunchOptions } from "./consts";


export async function launchBrowser(options = {}) {
    const browser = await puppeteer.launch({
        ...defaultpuppeteerLaunchOptions,
        ...options
    });

    return browser;
}