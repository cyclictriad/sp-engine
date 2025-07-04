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
        const messageStr = JSON.stringify(message) // Fixed variable name conflict
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
        const requiredFields = ['day', 'month', 'year', 'fns'];

        const missingFields = requiredFields.filter(f => !searchConfig.hasOwnProperty(f)).join(',')

        if (missingFields) errorMessage = 'Missing Fields: ' + missingFields
        if (!Array.isArray(searchConfig.fns)) errorMessage += '\n Fns must be a valid array'

        if (errorMessage) {
            throw new Error(errorMessage)
        }

        const { year, month, day, fns } = searchConfig;

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

        const url = `https://www.studypool.com/documents/year/${year}/${month}/${day}`

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        const lastHref = await page.$eval('li.last a', el => el.href)
        const lastPage = parseInt(lastHref.split('=').at(-1), 10)

        sendMessage(peer, {
            event: 'progress',
            lastPage
        })

        for (let currentPage = 1; currentPage <= lastPage; currentPage++) {
            // Check cancellation before each page
            if (/cancelled|idle/.test(SEARCH_STATE.status)) {

                break;
            }

            const generateNextPageUrl = () => `${url}?page=${currentPage}`

            try {
                await page.goto(generateNextPageUrl(), { waitUntil: 'domcontentloaded' })

                const pageResults = await extractCardInfo(page) // Fixed: use 'page' instead of 'globalState.page'

                sendMessage(peer, {
                    event: 'progress',
                    currentPage
                })

                const relevantResults = getBestMatches(pageResults, fns)

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

function getBestMatches(pageResults, fns) {
    return pageResults.filter(result => {
        return fns.some(fn => result.title.toLowerCase().includes(fn.contains.toLowerCase()) && result.pageCount >= fn.minPages)
    })
}

async function extractCardInfo(page) {
    try {
        await page.waitForSelector('.card.document', { timeout: 10000 }); // Add timeout

        const cards = await page.$$('.card.document');
        const results = [];

        for (const card of cards) {
            try {
                const url = await card.$eval('a', el => el.href).catch(() => null);
                const title = await card.$eval('.title', el => el.textContent.trim()).catch(() => 'Untitled');
                const pageInfoText = await card.$eval('.page-counter', el => el.textContent.trim()).catch(() => null);
                const pageCount = pageInfoText ? parseInt(pageInfoText.match(/(\d+)\s*pages/i)?.[1]) || 0 : 0; // Default to 0 instead of null

                results.push({
                    url,
                    title: title || '',
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