import Fuse from "fuse.js";

const SEARCH_STATE = {
    status: 'idle' // Start with idle instead of running
}
let browser, page;


export default defineWebSocketHandler({
    async open(peer) {
        // Initialize state when connection opens
        SEARCH_STATE.status = 'idle'
    },
    message(peer, event) {
        try {
            const data = JSON.parse(event.data)

            console.log(data)

            switch (data.event) {
                case 'START_SEARCH':
                    startSearch(data.config, peer)
                    break;
                case 'CANCEL':
                    SEARCH_STATE.status = 'cancelled'
                    sendMessage(peer, {
                        event: 'status',
                        status: 'cancelled'
                    })
                    break;
                case 'CLOSE':
                    SEARCH_STATE.status = 'idle'

                    browser?.close().then(() => {
                        browser = null

                        page = null

                        sendMessage(peer, {
                            event: 'status',
                            status: 'idle'
                        })
                    })

                default:
                    sendMessage(peer, {
                        event: 'status',
                        status: 'error',
                        errorMessage: `Unknown event: ${data.event}`
                    })
            }
        } catch (error) {
            sendMessage(peer, {
                event: 'status',
                status: 'error',
                errorMessage: error.message
            })
        }
    },
    close(peer) {
        console.log('Connection closed')
        // Clean up state when connection closes
        SEARCH_STATE.status = 'cancelled'
    }
})

function sendMessage(peer, message) {
    try {
        const messageStr = JSON.stringify(message)
        peer.send(messageStr)
    } catch (error) {
        console.error('Failed to send message:', error)
    }
}


async function startSearch(searchConfig, peer) {
    try {
        // Validation
        if (!searchConfig || !peer) {
            throw new Error('Search Config and Ws peer are required.')
        }

        let errorMessage = '';
        const requiredFields = ['queryString', 'minPages', 'sensitivity'];

        const missingFields = requiredFields.filter(f => !searchConfig.hasOwnProperty(f)).join(',')

        if (missingFields) errorMessage = 'Missing Fields: ' + missingFields

        if (errorMessage) {
            throw new Error(errorMessage)
        }

        const { queryString, minPages = 200, sensitivity = 0.3 } = searchConfig;

        // Set state to running
        SEARCH_STATE.status = 'running'
        sendMessage(peer, {
            event: 'status',
            status: 'running'
        })

        // Initialize browser and page
        if (!browser) {
            browser = await launchBrowser()
        }

        if (!page) {
            page = await browser.newPage()
        }

        const spUrl = 'https://www.studypool.com'

        await page.goto(spUrl, { waitUntil: 'domcontentloaded' })

        await page.type('#searchid', queryString)
        await page.click('#search-icon')
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

        const lastHref = await page.$eval('li.last a', el => el.href)
        const lastPage = parseInt(lastHref.split('=').at(-1), 10)

        sendMessage(peer, {
            event: 'progress',
            lastPage
        })

        for (let currentPage = 1; currentPage <= lastPage; currentPage++) {
            if (/cancelled|idle/.test(SEARCH_STATE.status)) {
                break;
            }

            try {
                await page.evaluate(() => {
                    const el = document.querySelector('li.next a')
                    if (el) el.click()
                })
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

                const pageResults = await extractCardInfo(page)

                sendMessage(peer, {
                    event: 'progress',
                    currentPage
                })

                const relevantResults = getBestMatches(pageResults, queryString, { minPages, sensitivity })

                if (relevantResults.length > 0) {
                    sendMessage(peer, {
                        event: 'results',
                        results: relevantResults
                    })
                }

            } catch (pageError) {
                if (
                    pageError.message.includes('Attempted to use detached Frame')
                    || pageError.message.includes('Protocol error (Page.navigate): Session closed. Most likely the page has been closed.')
                    || pageError.message.includes('Navigating frame was detached')
                ) {
                    try {
                        await browser?.close()
                    } catch { }
                    browser = await launchBrowser()
                    page = await browser.newPage()


                    // Continue to next page instead of stopping entirely
                    continue;
                } else {
                    sendMessage(peer, {
                        event: 'status',
                        status: 'error',
                        errorMessage: `Error processing page ${currentPage}: ${pageError.message}`
                    })
                }
            }
        }

    } catch (error) {
        SEARCH_STATE.status = 'error'
        sendMessage(peer, {
            event: 'status',
            status: 'error',
            errorMessage: error.message
        })
    }
}

async function extractCardInfo(page) {
    try {
        // Wait for the cards to be loaded
        await page.waitForSelector('.card.document', { timeout: 10000 });

        const cards = await page.$$('.card.document');
        const results = [];

        for (const card of cards) {
            try {
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
                const pageCount = pageInfoText ? parseInt(pageInfoText.match(/(\d+)\s*pages/i)?.[1]) || 0 : 0;

                // Add to results
                results.push({
                    url,
                    title: popoverInfo.title || '',
                    description: popoverInfo.description || '',
                    pageCount: pageCount || 0,
                });

            } catch (cardError) {
                console.error('Error extracting card info:', cardError)
                // Continue with next card instead of failing entirely
                continue;
            }
        }

        return results;
    } catch (error) {
        console.error('Error in extractCardInfo:', error)
        return []; // Return empty array on error
    }
}

/**
 * Extract edition from a string like "11e", "11th", "2nd", "3rd", etc.
 * @param {string} text - The text to extract edition from
 * @return {number|null} - The edition number or null if not found
 */
function extractEdition(text) {
    if (!text) return null;
    const cleaned = text.replace(/\s+/g, '').toLowerCase();
    const match = cleaned.match(/(\d{1,2})(e|st|nd|rd|th)/);
    const result = match ? parseInt(match[1], 10) : null;
    return result;
}


/**
 * Get best matching results based on query relevance, edition matching, and page count
 * @param {Array} results - The results to filter
 * @param {string} originalQuery - The original user query
 * @param {number} minPages - Minimum number of pages (defaults to 200)
 * @param {number} sensitivity - Fuse.js threshold for matching (defaults to 0.3)
 * @return {Array} - Filtered and sorted results
 */
function getBestMatches(results, originalQuery, { minPages, sensitivity }) {
    if (!results || !results.length) return [];

    // Extract edition from the original query
    const queryEdition = extractEdition(originalQuery);

    // Setup Fuse.js for fuzzy searching
    const fuseOptions = {
        keys: ['title', 'description'],
        includeScore: true,
        threshold: (1 - sensitivity)
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
    matchedResults = matchedResults.filter(item => item.pageCount >= minPages);

    // Precise edition matching
    if (queryEdition) {
        matchedResults = matchedResults.filter(item => {
            // Extract editions from title and description
            const titleEdition = extractEdition(item.title);
            const descriptionEdition = extractEdition(item.description);

            return titleEdition === queryEdition || descriptionEdition === queryEdition
        });

    }

    // Sort results by page count (descending)
    return matchedResults.sort((a, b) => b.pageCount - a.pageCount);
}