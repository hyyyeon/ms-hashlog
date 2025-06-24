// server.js
require('dotenv').config();              // ← .env 로드 (항상 최상단)

const express  = require('express');
const session  = require('express-session');
const path     = require('path');
const db       = require('./mysql');
const bcrypt   = require('bcrypt');

const app  = express();
const port = 3000;

/* ---------- 미들웨어 ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 폼 파싱 (사진에 있던 부분)
app.use(express.static(__dirname));

/* ---------- 세션 설정 ---------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET, // .env에서 읽어옴
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }           // HTTPS 적용 전이므로 false
  })
);

/* ---------- 라우팅 ---------- */

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* --- 회원가입 --- */
app.post('/signup', (req, res) => {
  const { id, pw, name } = req.body;
  if (!id || !pw || !name) return res.status(400).send('모두 입력하세요');

  // 비밀번호 해시화
  bcrypt.hash(pw, 10, (err, hash) => {
    if (err) return res.status(500).send('해시 오류');

    const sql = 'INSERT INTO user_table (User_id, User_pw, User_name) VALUES (?, ?, ?)';
    db.query(sql, [id, hash, name], (err) => {
      if (err) return res.status(500).send('DB 저장 오류');
      res.send('회원가입 성공');
    });
  });
});

/* --- 로그인 --- */
app.post('/login', (req, res) => {
  const { id, pw } = req.body;
  if (!id || !pw) return res.status(400).send('아이디/비번 입력');

  db.query('SELECT * FROM user_table WHERE User_id = ?', [id], (err, results) => {
    if (err) return res.status(500).send('DB 조회 오류');
    if (results.length === 0) return res.status(401).send('아이디 없음');

    bcrypt.compare(pw, results[0].User_pw, (err, match) => {
      if (match) {
        req.session.user = { id, name: results[0].User_name };
        res.send('로그인 성공');
      } else {
        res.status(401).send('비밀번호 틀림');
      }
    });
  });
});

/* --- 로그인 정보 확인 --- */
app.get('/me', (req, res) => {
  if (req.session.user) return res.json(req.session.user);
  res.status(401).send('로그인 필요');
});

/* --- 로그아웃 --- */
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('로그아웃 완료');
  });
});

/* ---------- 서버 시작 ---------- */
app.listen(port, () => {
  console.log(`서버 실행: http://localhost:${port}`);
});
