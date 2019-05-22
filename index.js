const INSTAGRAM_KEY = 'instagram'
const FACEBOOK_KEY = 'facebook'
const URLS_TO_CANCEL = [
    '*://*.facebook.com/ajax/mercury/change_read_status.php*',
    '*://*.instagram.com/stories/reel/seen',
    '*://*.instagram.com/ajax/bz*',
    '*://*.instagram.com/qp/batch_fetch_web*',
]

const isNodeEnv = typeof exports !== 'undefined'

// Chrome support: `browser` should fallback to `chrome`
// since Chrome doesn't fully support WebExtensions
if (typeof browser === 'undefined' && !isNodeEnv) {
    browser = chrome
}

const shouldCancelRequest = (url, storage) => {
    const isCancellable = key => {
        if (chrome) {
            // See: https://github.com/diessica/no-seen/issues/2
            return true
        }
        return url.includes(key) && storage.get().then(s => s[key] !== false)
    }
    if (isCancellable(INSTAGRAM_KEY)) {
       console.debug('Should cancel:', url);
    }
    return {
        cancel: isCancellable(INSTAGRAM_KEY),
    }
}

const handleRequest = ({ url }) =>
    shouldCancelRequest(url, browser.storage.sync)

const listenToRequests = () =>
    browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: URLS_TO_CANCEL },
        ['blocking']
    )

if (typeof browser === 'undefined' && isNodeEnv) {
    exports.shouldCancelRequest = shouldCancelRequest
} else {
    listenToRequests()
}
