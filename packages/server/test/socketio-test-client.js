const process = require('process');
const { io } = require('socket.io-client');
const fs = require('fs');
const axios = require('axios');
let rawPatches = fs.readFileSync('patches.json');
let patches = JSON.parse(rawPatches);

const SERVER_URL = 'http://0.0.0.0:1337';
// const SERVER_URL = 'https://api-dev.zskarte.ch';
const JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjYwODA1NDU1LCJleHAiOjE2NjMzOTc0NTV9.F9L-zcSY8252FiNcthmQAWgvBbC-ZsSPOd1GwFCST-I';
// const JWT_TOKEN =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjYwODE1ODYwLCJleHAiOjE2NjM0MDc4NjB9.9Oy0jJfdsE5T5NMILhVrM9__b0srNtXFFJ_oecHOwdU';
const IDENTIFIER = (Math.random() + 1).toString(36).substring(2);

const socket = io(SERVER_URL, {
  auth: {
    token: JWT_TOKEN,
  },
  transports: ['websocket'],
  query: `operationId=1&identifier=${IDENTIFIER}`,
});

socket.on('connect', () => {
  socket.on('state:patches', (patches) => {
    console.log('Patches received', patches);
  });
  console.log('Connected');
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
      identifier: IDENTIFIER,
      operationId: 1,
    },
  };
  axios
    .post(`${SERVER_URL}/api/operations/mapstate/patch`, patches, axiosConfig)
    .then(function (response) {
      console.log('Patches Sent', response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
});

process.stdin.resume();
