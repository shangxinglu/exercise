const http = require('http');

const PROP = 8080;

http.createServer((req,res)=>{
    req.on('data',chunk=>{
        // console.log('data');
    });

    req.on('end',()=>{
        console.log('end');;
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(`<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <div>
                <span>我是文本</span>
            </div>
        </body>
        </html>`);
    })

}).listen(PROP);