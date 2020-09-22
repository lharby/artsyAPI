/*
Author: Luke Harby
site: https://slackwise.org.uk
Date: Nov 2019

                __________
                 \       |
                  \______|
                 __|_____|.-'
  .-=-.           /    - -\
 / .-. \          {  =   Y}=
(_/   \ \          \      /
       \ \        _/`'`'`b
        \ `.__.-'`        \-._
         |            '.__ `'-;_
         |            _.' `'-.__)
          \    ;_..-`'      //
          |   /  /         //
          \  \ \__)       //
           \__)          //

*/

const request = require('superagent');
const fs = require('fs');

// global vars
const clientID = '14ac8c1864e2aeb9230a';
const clientSecret = '86fdbf58195312b0a71c78405d7dd4a3';
const baseUrl = 'https://api.artsy.net/api/';
const tokenUrl = 'tokens/xapp_token';
const size = 30;
let xappToken;
let dataWrite;
let cursorVar = '';
let cursor = '';
let offSet = 0;
let count = 0;

// request
//   .post(baseUrl + tokenUrl)
//   .send({ client_id: clientID, client_secret: clientSecret })
//   .then(function(res) {
//       xappToken = res.body.token;
//       requestShowData();
//   });

requestShowData = () => {
    const traverson = require('traverson');
    const JsonHalAdapter = require('traverson-hal');
    const xappToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsInN1YmplY3RfYXBwbGljYXRpb24iOiI1ZGMxOTA3NDIwNjdlZjAwMGQ3YWVmMWQiLCJleHAiOjE1NzM1NzMwODEsImlhdCI6MTU3Mjk2ODI4MSwiYXVkIjoiNWRjMTkwNzQyMDY3ZWYwMDBkN2FlZjFkIiwiaXNzIjoiR3Jhdml0eSIsImp0aSI6IjVkYzE5NzU5ZTNiNTZmMDAxMjA3Y2NmNCJ9.iGAZaFQ5ZaQstgzefC9b0Aq5XJrhPInML5IseUxdFSI';
    traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);
    api = traverson.from('https://api.artsy.net/api').jsonHal();

    api.newRequest()
        .follow('shows')
        .withTemplateParameters({
            size: size,
            cursorVar: cursor,
            offset: offSet
        })
        .withRequestOptions({
            headers: {
              'X-Xapp-Token': xappToken,
              'Accept': 'application/vnd.artsy-v2+json'
            }
        })
        .getResource(function(error, data) {
            shows = data._embedded.shows;
            next = data._links.next.href;
            cursorVar = 'cursor';
            cursor = next.split('=')[1].split('&')[0];
            // console.log('cursor: ', cursor, 'offset: ', offSet, 'count: ', count);
            for (let i = 0; i < shows.length; i++) {
                let name = shows[i].name;
                if (name.includes(':')) {
                    name = name.split(': ')[1];
                } else if (name.includes(',')) {
                    name = name.split(', ')[1];
                } else if (name.includes('-')) {
                    name = name.split('- ')[1];
                }
                dataWrite = name + ',\n';
                writeData();
            }
            if(next !== null && typeof next !== 'undefined' && next !== ''){
                requestShowData();
            }
    });
    count++;
    offSet = count * size;
}

requestShowData();

const writeData = () => {
    fs.appendFile('writeData/data' +count+ '.csv', dataWrite, (err) => {
        if(err) {
            throw err;
        }
    });
}
