// script.js

// --- SHA-256 해시 함수: 비밀번호를 안전하게 저장하기 위해 사용 ---
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- 쿠키 저장/조회/삭제 함수 ---
function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const [key, val] = v.split('=');
    return key === name ? val : r;
  }, '');
}
function clearCookies() {
  document.cookie.split(';').forEach(c => {
    document.cookie = c.replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`);
  });
}

// --- 화면 전환 함수 ---
function showPage(id) {
  document.querySelectorAll('.page').forEach(div => div.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// --- 페이지 로드 시: 로그인 상태 확인 ---
window.onload = () => {
  const user = getCookie('loginUser');
  if (user) {
    loadHome(user);
  } else {
    showPage('login');
  }
};

// --- 회원가입 버튼 클릭 ---
document.getElementById('btn-signup').onclick = async () => {
  const id = document.getElementById('signup-id').value.trim();
  const pw = document.getElementById('signup-pw').value;
  if (!id || !pw) return alert('아이디와 비밀번호를 입력하세요.');
  if (localStorage.getItem(id)) return alert('이미 가입된 아이디입니다.');
  const hash = await sha256(pw);
  localStorage.setItem(id, hash);
  alert('회원가입 완료! 로그인 해주세요.');
  showPage('login');
};

// --- 로그인 버튼 클릭 ---
document.getElementById('btn-login').onclick = async () => {
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  const savedHash = localStorage.getItem(id);
  if (!savedHash) return alert('존재하지 않는 아이디입니다.');
  const hash = await sha256(pw);
  if (hash !== savedHash) return alert('비밀번호가 틀렸습니다.');
  setCookie('loginUser', id);
  loadHome(id);
};

// --- 홈 화면 보여주기 ---
function loadHome(user) {
  document.getElementById('user-name').innerText = user;
  showPage('home');
}

// --- 피라미드 생성 버튼 클릭 ---
document.getElementById('btn-create').onclick = () => {
  const h = parseInt(document.getElementById('height').value);
  let text = '';
  for (let i = 0; i < h; i++) {
    text += ' '.repeat(h - i - 1) + '*'.repeat(i * 2 + 1) + '\n';
  }
  document.getElementById('result').innerText = text;
};

// --- 로그아웃 버튼 클릭 ---
document.getElementById('btn-logout').onclick = () => {
  clearCookies();
  showPage('login');
};

// --- 회원가입/로그인 페이지 링크 연결 ---
document.getElementById('link-signup').onclick = () => showPage('signup');
document.getElementById('link-login').onclick  = () => showPage('login');
