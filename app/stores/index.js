import { PROGRESS_STATUS, SEARCH_MODES } from "~/utils/consts";

const today = new Date();

// Initialize with a date exactly 8 days ago (last valid date)
const eightDaysAgo = new Date(today);
eightDaysAgo.setDate(today.getDate() - 8);

const searchState = reactive({
   [SEARCH_MODES.QUERY]: {
      config: {
         queryString: null,
         sensitivity: 1,
         minPages: 50,
      },
      progress: {
         status: PROGRESS_STATUS.IDLE,
         errorMessage: null,
         currentPage: 0,
         lastPage:Infinity
      },
      results: [],
      pagination: {
         currentPageIndex: 0,
         itemsPerPage: 10
      },
      startSearch() {
         this.ws = null;
         const connectWebSocket = () => {
            const apiUrl = `ws://localhost:3000/api/sp-query`
            this.ws = new WebSocket(apiUrl);

            this.ws.onopen = () => {
               this.ws.send(JSON.stringify({
                  event: 'START_SEARCH',
                  config: this.config
               }));
            };

            this.ws.onmessage = (event) => {
               let data;
               try {
                  data = JSON.parse(event.data);
               } catch (error) {
                  data = { event: 'unknown' }
               }

               switch (data.event) {
                  case 'status':
                     if (!data.status) return;
                     this.progress.status = data.status

                     if (data.errorMessage) {
                        this.progress.errorMessage = data.errorMessage
                     } else {
                        //clear error messages
                        this.progress.errorMessage = null
                     }
                     break;
                  case 'results':
                     if (!Array.isArray(data.results)) return;
                     this.results.push(...data.results);
                     break;
                  case 'progress':
                     if (data.lastPage) this.progress.lastPage = data.lastPage
                     if (data.currentPage) this.progress.currentPage = data.currentPage
                     break;

                  default:
                     console.warn('Received invalid event type:', data.event)
               }
            };

            this.ws.onclose = () => {
               console.log("WebSocket connection closed.");
            };

            this.ws.onerror = (error) => {
               console.error("WebSocket error:", error);
            };
         };

         connectWebSocket();
      }
   },
   [SEARCH_MODES.DATE]: {
      config: {
         day: eightDaysAgo.getDate(),
         month: eightDaysAgo.getMonth() + 1,
         year: eightDaysAgo.getFullYear(),
         fns: [
            {
               contains: 'Test Bank',
               minPages: 130
            }
         ]
      },
      progress: {
         status: PROGRESS_STATUS.IDLE,
         errorMessage: null,
         currentPage: 0,
         lastPage:Infinity
      },
      results: [],
      pagination: {
         currentPageIndex: 0,
         itemsPerPage: 10
      },
      startSearch() {
         this.ws = null;
         const connectWebSocket = () => {
            const apiUrl = `ws://localhost:3000/api/sp-date`
            this.ws = new WebSocket(apiUrl);

            this.ws.onopen = () => {
               this.ws.send(
                  JSON.stringify({
                     event: 'START_SEARCH',
                     config: this.config
                  })
               );
            };

            this.ws.onmessage = (event) => {
               let data;
               try {
                  data = JSON.parse(event.data);
               } catch (error) {
                  data = { event: 'unknown' }
               }

               switch (data.event) {
                  case 'status':
                     if (!data.status) return;
                     this.progress.status = data.status;
                     if (data.errorMessage) {
                        this.progress.errorMessage = data.errorMessage
                     } else {
                        //clear error messages
                        this.progress.errorMessage = null
                     }
                     break;
                  case 'results':
                     if (!Array.isArray(data.results)) return;
                     this.results.push(...data.results);
                     break;
                  case 'progress':
                     if (data.lastPage) this.progress.lastPage = data.lastPage
                     if (data.currentPage) this.progress.currentPage = data.currentPage
                     break;

                  default:
                     console.warn('Received invalid event type:', data.event)
               }
            };

            this.ws.onclose = () => {
               console.log("WebSocket connection closed.");
            };

            this.ws.onerror = (error) => {
               console.error("WebSocket error:", error);
            };
         };

         connectWebSocket();
      }
   }
})

export const sendMessageWs = (searchMode, data) => {
   if (!Object.values(SEARCH_MODES).includes(searchMode) || !data?.event) throw Error('Invalid Search Mode or event missing in data');

   const ws = searchState[searchMode].ws

   if (!ws) {
      console.warn('Websocket connection is not available')
      return
   }

   ws.send(JSON.stringify(data))

   return true
}

export default searchState;