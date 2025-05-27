// server.js
var express = require('express');
var session = require('express-session');
var path = require('path');
var db = require('./mysql');    
var bcrypt = require('bcrypt');
var app = express();
var port = 3000;

app.use(express.json());
app.use(express.static(__dirname));
// 세션 설정
app.use(session({
  secret: 'secret!', // 세션 암호화 키
  resave: false, // 세션을 다시 저장하지 않음
  saveUninitialized: true
}));

// 메인페이지 -> index.html 전송
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 회원가입
app.post('/signup', function(req, res) {
  var id = req.body.id, pw = req.body.pw, name = req.body.name;
    // 필수 값 확인
  if (!id || !pw || !name) return res.status(400).send('모두 입력하세요');
  // 비밀번호를 해시로 변환
  bcrypt.hash(pw, 10, function(err, hash) {
    if (err) return res.status(500).send('해시 오류');
  // 해쉬 pw를 DB에 저장
    var sql = 'INSERT INTO user_table (User_id, User_pw, User_name) VALUES (?, ?, ?)';
    db.query(sql, [id, hash, name], function(err) {
      if (err) return res.status(500).send('DB 저장 오류');
      res.send('회원가입 성공');
    });
  });
});

// 로그인
app.post('/login', function(req, res) {
  var id = req.body.id, pw = req.body.pw;
    // 입력값 확인
  if (!id || !pw) return res.status(400).send('아이디/비번 입력');
  // DB에서 해당 아이디 검색
  db.query('SELECT * FROM user_table WHERE User_id = ?', [id], function(err, results) {
    if (err) return res.status(500).send('DB 조회 오류');
    if (results.length === 0) return res.status(401).send('아이디 없음');
    // 비밀번호 비교
    bcrypt.compare(pw, results[0].User_pw, function(err, match) {
      if (match) {
        // 로그인 성공 시, 세션에 사용자 정보 저장
        req.session.user = { id, name: results[0].User_name };
        res.send('로그인 성공');
      } else {
        res.status(401).send('비밀번호 틀림');
      }
    });
  });
});

// 로그인 정보 확인
app.get('/me', function(req, res) {
  if (req.session.user) return res.json(req.session.user);
  res.status(401).send('로그인 필요');
});

// 로그아웃
app.post('/logout', function(req, res) {
  req.session.destroy(function() {
    res.send('로그아웃 완료');
  });
});

// 서버 시작
app.listen(port, function() {
  console.log('서버 실행: http://localhost:' + port);
});
