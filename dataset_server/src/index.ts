const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
const fs = require('fs');

import * as http from 'http';
import { ParsedUrlQuery } from 'querystring';
import * as url from 'url';

const filePath = './dataset_server/datasets/megavul.json'; // Path to your large JSON file
const hostname: string = '127.0.0.1'; // or 'localhost'
const port: number = 3000;

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  // Parse the URL to get query parameters

  if (req.method === 'POST' && req.url === '/multi') {
    getCweByAmount(req, res);
  }
  else if (req.url === '/sard') {
    getSARDbadDataset(res, "bad");
  }
  else if (req.url === '/sard_good') {
    getSARDbadDataset(res, "good");
  }
  else if (req.url === '/sard_1000') {
    getSARDbadDataset(res, "1000");
  }
  else if (req.url === '/sard_1000_30_gemini') {
    getSARDbadDataset(res, "1000_30_gemini");
  }
  else if (req.url === '/sard_1000_30_gpt') {
    getSARDbadDataset(res, "1000_30_gpt");
  }else if (req.url === '/sard_1000_30_claude') {
    getSARDbadDataset(res, "1000_30_claude");
  }
  else {
    getOneCweByIndex(req, res);
  }


});

server.listen(port, hostname, () => {
  console.log(`Dataset server running at http://${hostname}:${port}/`);
});

function getSARDbadDataset(res: http.ServerResponse<http.IncomingMessage>, type: string) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  
  var sardFilePath = "";

  if(type === "1000"){
    sardFilePath = './dataset_server/datasets/SARD/sard_1000_subset.json'; // Path to your SARD JSON file
  }
  else if(type === "1000_30_gemini"){
    sardFilePath = './dataset_server/datasets/SARD/sard_1000_subset_30_gemini.json'; // Path to your SARD JSON file
  }
  else if(type === "1000_30_gpt"){
    sardFilePath = './dataset_server/datasets/SARD/sard_1000_subset_30_gpt.json'; // Path to your SARD JSON file
  }
  else if(type === "1000_30_claude"){
    sardFilePath = './dataset_server/datasets/SARD/sard_1000_subset_30_claude.json'; // Path to your SARD JSON file
  }
  else if (type === "bad") {
  
    sardFilePath = './dataset_server/datasets/SARD/sard_subset.json'; // Path to your SARD JSON file
  }
  else {
    sardFilePath = './dataset_server/datasets/SARD/sard_good_subset.json'; // Path to your SARD JSON file
  } 

  const sardFileStream = fs.createReadStream(sardFilePath);
  const sardJsonStream = sardFileStream.pipe(parser()).pipe(streamArray());

  const sardResults: any[] = [];

  sardJsonStream.on('data', ({ value }: { value: any; }) => {
    sardResults.push(value);
  });

  sardJsonStream.on('end', () => {
    sardFileStream.destroy();
    res.write(JSON.stringify(sardResults));
    res.end();
  });

  sardJsonStream.on('error', (err: Error) => {
    sardFileStream.destroy();
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + err.message);
  });
}

function getOneCweByIndex(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {

  const queryObject = url.parse(req.url!, true).query;
  const cwe = queryObject.cwe as string || '';
  const index = queryObject.index as string || '';

  // Set the response header to indicate JSON content
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });


  const fileStream = fs.createReadStream(filePath);

  const jsonStream = fileStream.pipe(parser()).pipe(streamArray());

  var counter = 0;

  jsonStream.on('data', ({ value }: { value: any; }) => {
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

  jsonStream.on('error', (err: Error) => {
    console.log('Finished processing JSON file. number of CWE-119: ', counter);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + err.message);

  });
}


function getCweByAmount(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {

  let requestBody: any = null;
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      requestBody = JSON.parse(body);
      console.log('Received data:', requestBody);

      var cweID: string;
      var amount: number;

      // Send a response
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

      const mapCWE = new Map();

      Object.keys(requestBody).forEach(key => {
        if((!/^\d+$/.test(key) == false && requestBody[key] && typeof requestBody[key].amount === 'number')){

          cweID = "CWE-" + key.toString()
          amount = requestBody[key].amount;
          mapCWE.set(cweID, amount);
        }
      });


        const fileStream = fs.createReadStream(filePath);
        const jsonStream = fileStream.pipe(parser()).pipe(streamArray());

        const results: any[] = [];

        jsonStream.on('data', ({ value }: { value: any }) => {

          const item = value;
          //console.log(JSON.stringify(item));

          var cwe =  item.cwe_ids[0].toString();
          var index = mapCWE.get(cwe);

          if(mapCWE.size == 0){
            console.log('No more CWEs to process');
            jsonStream.destroy();
            fileStream.destroy();
            res.write(JSON.stringify(results));
            res.end();

          }
          else if(  mapCWE.has(cwe) && index > 0){

            if(item.is_vul){
              results.push(item);
              console.log(cwe + ' - ' + index );

              if(index > 1){
                mapCWE.set(cwe, index - 1);
              }
              else{
                mapCWE.delete(cwe);
              }
            }
          }
        });

        jsonStream.on('end', () => {
          jsonStream.destroy();
          fileStream.destroy();
          res.end(JSON.stringify({ message: 'Data received successfully, CWEs not found!' }));
        });

        jsonStream.on('error', (err: Error) => {
          fileStream.destroy();
          console.error('Error processing JSON file:', err.message);
        });
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid JSON');
      return;
    }
  });


}
// Removed duplicate function implementation

