const { parse } = require("url");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const fs = require("fs");
const handle = app.getRequestHandler();
const http = require('http');

let httpsOptions = {};
var { createServer } = require("http");
if (dev) {
  var { createServer } = require("https");
  httpsOptions = {
    key: fs.readFileSync("./dev/cert/localhost.key"),
    cert: fs.readFileSync("./dev/cert/localhost.crt"),
  };
}

const PORT = process.env.PORT || 3000;
app.prepare().then(async () => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const {pathname, query } = parsedUrl
    if (pathname == "/reset_buttons"){
      console.log(pathname)
      http.get('http://10.0.20.141/reset')
      app.render(req, res, '/404', query)
    }
    
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${PORT}`);
  });
});
