const http = require('http');

const PROP = 8080;

http.createServer((req,res)=>{
    req.on('data',chunk=>{
        // console.log('data');
    });

    req.on('end',()=>{
        console.log('end');;
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(`My is server`);
    })

}).listen(PROP);