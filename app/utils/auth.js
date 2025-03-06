
import globalState from '../stores'

export async function login(endpoint = '/api/sp-login') {
    try {
        globalState.auth.progress.success = false
        globalState.auth.progress.error = null
        globalState.auth.progress.loading = true

        // get credentials in localStorage
        const username = localStorage.getItem('sp_username')
        const password = localStorage.getItem('sp_password')


        if (!username || !password) {
            globalState.auth.credentialsRequested = true;
            return;
        }

        globalState.auth.credentialsRequested = false;

        await $fetch(endpoint, {
            method: 'POST',
            body: {
                username,
                password
            }
        })

        globalState.auth.progress.success = true
    } catch (error) {

        globalState.auth.progress.error = error.message ?? 'Auth Failed'

    } finally {
        globalState.auth.progress.loading = false

    }
}