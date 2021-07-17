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
                .flex {
                    display: flex;
                    width: 375px;
                    background-color: rgba(255, 0, 0, 1);
                }
        
        
                .d1 {
                    width: 100px;
                    height: 50px;
                    background-color: rgba(255, 255, 0, 1);
        
                }
        
                .d2 {
                    width: 200px;
                    height: 150px;
                    background-color: rgba(0, 255, 255, 1);
        
                }
            </style>
        </head>
        
        <body>
            <div class="flex">
                <div class="d1 flex__item"></div>
                <div class="d1"></div>
                <div class="d2"></div>
                <div class="d3"></div>
            </div>
        </body>
        </html>`);
    })

}).listen(PROP);