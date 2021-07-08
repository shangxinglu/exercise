
const net = require('net');
const {parseHTML} = require('./parseHTML.js');

const bodyTransMethod = {
    'application/x-www-from-urlencoded': body => {
        return Object.keys(body).map(key => `${key}=${encodeURIComponent(body[key])}`).join('&');
    },
    'application/json': body => {
        return JSON.stringify(body);
    }
}

/**
 * 负责HTTP请求
 */
class Request {
    constructor(options) {
        ({
            host: this.host,
            port: this.port = 80,
            path: this.path = '/',

            url: this.url,
            method: this.method = 'GET',
            headers: this.headers = {},
            body: this.body = {},
        } = options);

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-from-urlencoded';
        }

        this.bodyText = bodyTransMethod[this.headers['Content-Type']](this.body);

        this.headers['Content-Length'] = this.bodyText.length;

    }

    send(connect) {
        return new Promise((resolve, reject) => {

            if (connect) {
                connect.write(this.toString());
            } else {
                connect = net.createConnection({
                    port: this.port,
                    host: this.host,
                }, () => {
                    console.log('createConnect');
                    connect.write(this.toString());

                });
            }

            connect.on('data', chunk => {
                console.log('data', chunk.toString());
                const response = new Response;

                response.receiver(chunk.toString());
                resolve(response.getResponse());
            })

            connect.on('error', error => {
                console.log('error', error);
                reject(error);
                connect.end();
            })
        })


    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\n')}
\r\n${this.bodyText}`;
    }
}

/**
 * 负责响应
 */
class Response {

    constructor() {
        this.status = this.parseProtocol;
        this.protocol = '';
        this.statusCode = '';
        this.statusPrompt = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParse = null;
        this.bodyText = '';
    }

    receiver(str) {
        for (let i = 0, len = str.length; i < len; i++) {
            this.status(str.charAt(i));
        }


    }

    getResponse() {
        return {
            code: this.statusCode,
            protocol: this.protocol,
            status: this.statusPrompt,
            headers: this.headers,
            body: this.bodyText,
        }
    }

    parseProtocol(char) {
        if (char === ' ') {
            if (!this.protocol) return;
            this.status = this.parseStatusCode;
            return;
        }
        this.protocol += char;
    }

    parseStatusCode(char) {
        if (char === ' ') {
            if (!this.statusCode) return;
            this.status = this.parseStatusPrompt;
            return;
        }
        this.statusCode += char;
    }

    parseStatusPrompt(char) {
        if (char === '\r') return;

        if (char === '\n') {
            this.status = this.parseHeaderName;
            return;
        }
        this.statusPrompt += char;
    }

    parseHeaderName(char) {
        if (char === ':') {
            this.status = this.parseHeaderVaule;
            return;
        }

        this.headerName += char;
    }

    parseHeaderVaule(char) {
        if ([' ', '\r'].includes(char)) return;

        if (char === '\n') {
            const { headerName, headerValue } = this;
            this.headers[headerName] = headerValue;
            this.headerName = '',
                this.headerValue = '';

            if (this.headers['Transfer-Encoding'] === 'chunked') {
                this.bodyParse = new ChunkParse;
            }
            this.status = this.parseEnter;

            return;
        }

        this.headerValue += char;
    }

    parseEnter(char) {
        if (char === '\r') {
            this.status = this.parseLine;
            return;
        }
        this.status = this.parseHeaderName;
        this.status(char);

    }

    parseLine(char) {
        if (char === '\n') {
            this.status = this.parseBody;
        }
    }

    parseBody(char) {
        this.bodyText += this.bodyParse.receiverChar(char);
    }

}

class ChunkParse {
    constructor() {
        this.length = '0x';
        this.status = this.parseLength;
        // this.bodyText = '';
    }

    receiverChar(char) {
        return this.status(char) || '';
    }

    parseLength(char) {
        if (char === '\r') return;
        if (char === '\n') {
            this.length = parseInt(this.length);
            this.status = this.parseBody;
            return;
        }

        this.length += char;
    }

    parseEnd(char) {
        if(char ==='\n') {
            this.status = this.parseLength;
            return;
        }
    }


    parseBody(char) {
        if (this.length === 0) {
            if (char === '\r') return;

            if (char==='\n'){
                this.status = this.parseEnd;

            }
            return;
        }

        this.length--;
        return char;
    }
}

async function get() {
    const request = new Request({
        url: '127.0.0.1:8080',
        host: '127.0.0.1',
        port: '8080',
        path: '/',
        method: 'POST',
        body: {
            v: 1
        },
    })

    const data = await request.send();
    const dom = parseHTML(data.body);
}

get();
