import { globalState } from "../stores/index";

export default defineEventHandler(async (event) => {
    const { year, month, day, searchDepth, minPages = 130, offset = 0 } = await readValidatedBody(event, body => {

        const requiredFields = ['day', 'month', 'year', 'searchDepth'];
        const missingFields = [];

        requiredFields.forEach(f => {
            if (!body[f]) {
                missingFields.push(f)
            }
        })

        if (missingFields.length > 0) {
            throw createError({
                status: 400,
                statusMessage: "Bad request",
                message: "Missing required fields",
                data: {
                    missingFields
                }
            })
        }


        return body;
    })

    if (!globalState.browser) {
        globalState.browser = await launchBrowser()
    }


    if (!globalState.page) {
        globalState.page = await globalState.browser.newPage()
    }

    const url = `https://www.studypool.com/documents/year/${year}/${month}/${day}`


    let results = []


    for (let currentPage = offset + 1; currentPage <= (searchDepth + offset); currentPage++) {
        const generateNextPageUrl = () => `${url}?page=${currentPage}`

        await globalState.page.goto(generateNextPageUrl(), { waitUntil: 'domcontentloaded' })


        const pageResults = await extractCardInfo(globalState.page)

        results = [...results, ...pageResults]

    }


    return getBestMatches(results, minPages);

})


async function extractCardInfo(page) {
    await page.waitForSelector('.card.document');

    const cards = await page.$$('.card.document');
    const results = [];

    for (const card of cards) {
        const url = await card.$eval('a', el => el.href).catch(() => null);

        const title = await card.$eval('.title', el => el.textContent.trim()).catch(() => 'Untitled');
        const pageInfoText = await card.$eval('.page-counter', el => el.textContent.trim()).catch(() => null);
        const pageCount = pageInfoText ? parseInt(pageInfoText.match(/(\d+)\s*pages/i)?.[1]) : null;

        results.push({
            url,
            title,
            pageCount,
        });
    }

    return results;
}




/**
 * Get best matching results based on query relevance, edition matching, and page count
 * @param {Array} results - The results to filter
 * @param {number} minPages - Minimum number of pages (defaults to 130)
 * @return {Array} - Filtered and sorted results
 */
function getBestMatches(results, minPages) {
    if (!results || !results.length) return [];

    results = results.filter(item => item.pageCount >= minPages);

    results.sort((a, b) => b.pageCount - a.pageCount);

    return results;
}
