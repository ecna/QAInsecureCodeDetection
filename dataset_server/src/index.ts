const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
const fs = require('fs');

import * as http from 'http';
import * as url from 'url';

const filePath = './dataset_server/datasets/megavul.json'; // Path to your large JSON file
const hostname: string = '127.0.0.1'; // or 'localhost'
const port: number = 3000;

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  // Parse the URL to get query parameters
  const queryObject = url.parse(req.url!, true).query;
  const cwe = queryObject.cwe as string || '';
  const index = queryObject.index as string || '';

  // Set the response header to indicate JSON content
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });


  const fileStream = fs.createReadStream(filePath);

  const jsonStream = fileStream.pipe(parser()).pipe(streamArray());

  var counter = 0;

  jsonStream.on('data', ({ value }: { value: any }) => {
    // console.log(`Key: ${key}, Value:`, value); // Process individual items

    const item = value;

    var CWE = "CWE-" + cwe;

    if (item.cwe_ids == CWE && item.is_vul) {

      if (counter == Number(index)) {

        jsonStream.destroy();
        fileStream.destroy();

        console.log('Finished processing JSON file. Found: ' + CWE + ' - number: ' + counter);
        
        res.write(JSON.stringify(item));
        res.end();

      }

      counter++;
    }
  });


  jsonStream.on('end', () => {
  console.log('Finished processing JSON file. number of CWE-119: ', counter);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('End of dataset');
});

jsonStream.on('error', (err: Error)  => {
  console.log('Finished processing JSON file. number of CWE-119: ', counter);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Internal Server Error: ' + err.message);

});


});

server.listen(port, hostname, () => {
  console.log(`Dataset server running at http://${hostname}:${port}/`);
});