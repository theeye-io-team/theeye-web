module.exports.session =  {
  adapter: 'connect-redis',
  host: 'localhost',
  port: 6379,
  db: 0, //(process.env.DATABASE||'theeye')
  prefix: 'sess:',
  // default values
  cookie:{
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: null
  }
}
