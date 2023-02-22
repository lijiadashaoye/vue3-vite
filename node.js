import http from 'http';

http.createServer((req, res) => {
    if (req.url != '/favicon.ico') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Max-Age', '100000');
        res.setHeader('Cache-Control', 'max-age=2000');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        res.setHeader('Referer-Policy', 'strict-origin-when-cross-origin');

        var k = req.url.slice(1).split('/');
        // 读取excel文件
        if (k[0] === 'sse') {
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Content-Type', 'text/event-stream')
            setTimeout(() => {
                let data = {
                    name: 'eventsource'
                },
                    back = `data:${JSON.stringify(data)}\n\n`
                res.end(back)
            }, 2000)

        }
    } else {
        res.end('')
    }
}).listen(2342)