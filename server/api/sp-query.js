import { globalState } from "../stores/index";
import Fuse from "fuse.js";

export default defineEventHandler(async (event) => {
    const { query, searchDepth, minPages = 200, maxPages = 500, sensitivity = 0.3 } = await readValidatedBody(event, body => {
        if (!body.query || !body.searchDepth) {
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


    for (let currentPage = 1; currentPage <= searchDepth; currentPage++) {
        const generateNextPageUrl = () => `${url}&page=${currentPage}`

        await globalState.page.goto(generateNextPageUrl(), { waitUntil: 'domcontentloaded' })


        const pageResults = await extractCardInfo(globalState.page)

        results = [...results, ...pageResults]

    }

    return getBestMatches(results, query, { minPages, maxPages, sensitivity });

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


/**
 * Extract edition from a string, supporting formats like "1st edition", "2nd", "3rd", "4th" or "1e", "2e", "3e"
 * @param {string} text - The text to extract edition from
 * @return {number|null} - The edition number or null if not found
 */
function extractEdition(text) {
    if (!text) return null;

    // Match patterns like "1st edition", "2nd", "3rd", "4th", etc.
    const ordinalMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)(?:\s+edition)?/i);
    if (ordinalMatch) {
        return parseInt(ordinalMatch[1], 10);
    }

    // Match patterns like "1e", "2e", "3e", etc.
    const shortFormMatch = text.match(/(\d{1,2})e\b/i);
    if (shortFormMatch) {
        return parseInt(shortFormMatch[1], 10);
    }

    return null;
}

/**
 * Get best matching results based on query relevance, edition matching, and page count
 * @param {Array} results - The results to filter
 * @param {string} originalQuery - The original user query
 * @param {number} minPages - Minimum number of pages (defaults to 200)
 * @return {Array} - Filtered and sorted results
 */
function getBestMatches(results, originalQuery, {minPages, maxPages, sensitivity}) {
    if (!results || !results.length) return [];

    // Extract edition from the original query
    const queryEdition = extractEdition(originalQuery);

    // Setup Fuse.js for fuzzy searching
    const fuseOptions = {
        keys: ['title', 'description'],
        includeScore: true,
        threshold: sensitivity
    };
    const fuse = new Fuse(results, fuseOptions);

    // Get fuzzy matches if there's an original query
    let matchedResults = originalQuery ?
        fuse.search(originalQuery).map(result => ({
            ...result.item,
            score: result.score
        })) :
        results;

    // Filter by pages
    matchedResults = matchedResults.filter(item => item.pageCount >= minPages && item.pageCount <= maxPages);

    // Process edition matching
    matchedResults = matchedResults.map(item => {
        // Extract editions from title and description
        const titleEdition = extractEdition(item.title);
        const descriptionEdition = extractEdition(item.description);

        // Score bonus for edition match
        let editionMatchScore = 0;
        if (queryEdition && (titleEdition === queryEdition || descriptionEdition === queryEdition)) {
            editionMatchScore = 1; // Boost items with matching edition
        }

        return {
            ...item,
            editionMatchScore
        };
    });

    // Sort results: first by edition match, then by page count (descending)
    return matchedResults.sort((a, b) => {
        // First sort by edition match
        if (b.editionMatchScore !== a.editionMatchScore) {
            return b.editionMatchScore - a.editionMatchScore;
        }
        // Then by page count
        return b.pageCount - a.pageCount;
    });
}
