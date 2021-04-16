// Database:
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
  ojehsu: { longURL: 'https://www.amazon.ca', userID: 'rHrJoy' },
};

// User Database: (password: user01, user02...so on...)
const users = {
  rHrJoy: {
    id: 'rHrJoy',
    email: 'user01@gmail.com',
    password: '$2b$10$0Rd2NqGDNHeQtsGiBI5hkeXqltUw5VBvahJoWUuHiPGh0kRVmdq1W',
  },
  JAc4Kn: {
    id: 'JAc4Kn',
    email: 'user02@gmail.com',
    password: '$2b$10$i11xOK.GU2EwgH3NCIm1YukhD4jbqEdWmdrU604s/ij1bolK6XDZu',
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user03@gmail.com',
    password: '$2b$10$/msnEHRHDN9v7Z6BlnGBDebKTKfXpjqP3tlDliG5DN0sQt3DEEth2',
  },
};

module.exports = { urlDatabase , users };