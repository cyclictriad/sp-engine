

const globalState = reactive({
    auth: {
        credentialsRequested: false,
        progress: {
            loading: false,
            error: null,
            success: false
        }
    },
    search: {
        progress: {
            loading: false,
            error: null,
            success: false
        },
        results: [],
        pagination: {
            currentPage: 1,
            perPage:10
        }
    },

})

export default globalState;