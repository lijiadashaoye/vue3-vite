onmessage = (msg) => {
    console.log(msg)
    setTimeout(() => {
        postMessage('55555')
    }, 5000)
}