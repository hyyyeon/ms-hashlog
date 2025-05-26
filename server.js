// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./mysql'); // mysql.js에서 연결된 DB 모듈

const app = express();
const port = 3000;

// ─── 미들웨어 설정 ─────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'my-secret-key', // 세션 암호화 키
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 } // 30분 유지
}));
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더 정적 제공

// ─── 페이지 연결 ───────────────────────
app.get('/', (req, res) => {
  res.redirect('/login.html'); // 기본 페이지 → 로그인
});

app.get('/pyramid', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'public', 'pyramid.html'));
});

// ─── 회원가입 처리 ─────────────────────
app.post('/api/signup', async (req, res) => {
  const { id, pw, name } = req.body;
  if (!id || !pw || !name) return res.status(400).send('모든 정보를 입력하세요.');

  try {
    const hash = await bcrypt.hash(pw, 10);
    const sql = 'INSERT INTO user_table (User_id, User_pw, User_name) VALUES (?, ?, ?)';
    db.query(sql, [id, hash, name], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('이미 존재하는 아이디입니다.');
        return res.status(500).send('DB 오류');
      }
      res.send('회원가입 성공');
    });
  } catch (e) {
    res.status(500).send('서버 오류');
  }
});

// ─── 로그인 처리 ───────────────────────
app.post('/api/login', (req, res) => {
  const { id, pw } = req.body;
  if (!id || !pw) return res.status(400).send('아이디와 비밀번호를 입력하세요.');

  const sql = 'SELECT * FROM user_table WHERE User_id = ?';
  db.query(sql, [id], async (err, results) => {
    if (err) return res.status(500).send('DB 오류');
    if (results.length === 0) return res.status(401).send('존재하지 않는 아이디입니다.');

    const user = results[0];
    const match = await bcrypt.compare(pw, user.User_pw);
    if (!match) return res.status(401).send('비밀번호가 일치하지 않습니다.');

    req.session.user = { id: user.User_id, name: user.User_name };
    res.send('로그인 성공');
  });
});

// ─── 로그인 상태 확인 ───────────────────
app.get('/api/me', (req, res) => {
  if (req.session.user) return res.json(req.session.user);
  res.status(401).send('로그인 필요');
});

// ─── 로그아웃 처리 ─────────────────────
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.send('로그아웃 되었습니다.');
  });
});

// ─── 서버 시작 ──────────────────────────
app.listen(port, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${port}`);
});
