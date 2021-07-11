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
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style>
                .d1{
                    width:100px;
                    height:200px;
                }

                div .d2{
                    height:100px;
                    background-color:cyan;
                }

                span .d3{
                    font-size:24px;
                }
            </style>
        </head>
        <body>
            <div class="d1 d3">
                <span class="d2">我是文本</span>
            </div>
        </body>
        </html>`);
    })

}).listen(PROP);