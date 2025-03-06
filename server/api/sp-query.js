import { globalState } from "../stores/index";

export default defineEventHandler(async (event) => {
    const { query, maxPages } = await readValidatedBody(event, body => {
        if (!body.query || !body.maxPages) {
            throw createError({
                status: 400,
                statusMessage: "Bad request",
                message: "Query and max pages required",
            })

        }
        return body;

    })


    if (!globalState.isLoggedIn || !globalState.browser) {
        throw createError({
            status: 401,
            statusMessage: "Unauthorized",
            message: "Browser not open or not logged in",
        })
    }


    if (!globalState.page) {
        globalState.page = await globalState.browser.newPage()
    }

    const url = `https://www.studypool.com/notebank/search?notebank_qs=${decodeURIComponent(query)}`


    let results = []


    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
        const generateNextPageUrl = () => `${url}&page=${currentPage}`

        await globalState.page.goto(generateNextPageUrl(), { waitUntil: 'domcontentloaded' })


        const pageResults = await extractCardInfo(globalState.page)

        results = [...results, ...pageResults]

    }

    return getBestMatches(results, query);

})


async function extractCardInfo(page) {
    // Wait for the cards to be loaded
    await page.waitForSelector('.card.document');

    const cards = await page.$$('.card.document');
    const results = [];

    for (const card of cards) {
        // Extract the URL
        const url = await card.$eval('a', el => el.href).catch(() => null);

        // Select the popover inside the card
        const popover = await card.$('.notebank-popover');
        if (!popover) continue; // Skip if no popover found

        // Extract information from the popover
        const popoverInfo = await popover.evaluate(el => {
            const title = el.querySelector('h5')?.textContent.trim() || '';
            const description = el.querySelector('.description')?.textContent.trim() || '';

            return { title, description };
        });

        // Extract page count from the card itself (not the popover)
        const pageInfoText = await card.$eval('.page-counter', el => el.textContent.trim()).catch(() => null);
        const pageCount = pageInfoText ? parseInt(pageInfoText.match(/(\d+)\s*pages/i)?.[1]) : null;

        // Add to results
        results.push({
            url,
            title: popoverInfo.title,
            description: popoverInfo.description,
            pageCount,
        });
    }

    return results;
}

function getBestMatches(results, originalQuery) {
    // Extract edition (e.g., "12th", "10th", "6th") from the query
    const editionMatch = originalQuery.match(/(\d{1,2})(?:st|nd|rd|th)\s+edition/i);
    const edition = editionMatch ? editionMatch[0] : null;

    if (!edition) return []; // Return empty array if no edition found

    // Filter results based on page count and edition match
    return results.filter(item =>
        item.pageCount > 200 &&
        (item.title.includes(edition) || item.description.includes(edition))
    );
}
