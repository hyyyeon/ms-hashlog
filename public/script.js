let idChecked = false;
let lastCheckedId = "";

// 페이지 전환 함수
function showPage(id) {
  document.querySelectorAll('.page').forEach(div => {
    div.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

// 피라미드 만들기
function makePyramid() {
  const h = parseInt(document.getElementById("height").value);
  if (isNaN(h) || h < 1) {
    document.getElementById("pyramid").innerHTML = "1 이상의 숫자를 입력하세요.";
    return;
  }
  let result = "";
  for (let i = 0; i < h; i++) {
    result += "&nbsp;".repeat(h - i - 1) + "*".repeat(i * 2 + 1) + "<br>";
  }
  document.getElementById("pyramid").innerHTML = result;
}

// 로그인 요청
function login() {
  const id = document.getElementById("login-id").value;
  const pw = document.getElementById("login-pw").value;
  if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요!");

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password: pw }),
  })
    .then(res => res.json())
    .then(result => {
      if (result.result) {
        alert("로그인 성공!");
        showPage("pyramid-page");
      } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      }
    })
    .catch(() => alert("서버 연결 오류"));
}

// 회원가입 - 아이디 중복 확인
function checkId() {
  const id = document.getElementById("signup-id").value;
  if (!id) return alert("아이디를 입력하세요!");

  fetch("/api/check-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then(res => res.json())
    .then(result => {
      if (result.result) {
        document.getElementById("check-result").innerText = "사용 가능한 아이디입니다.";
        idChecked = true;
        lastCheckedId = id;
      } else {
        document.getElementById("check-result").innerText = "이미 존재하는 아이디입니다.";
        idChecked = false;
      }
    })
    .catch(() => alert("서버 오류"));
}

// 회원가입 요청
function signup() {
  const id = document.getElementById("signup-id").value;
  const pw = document.getElementById("signup-pw").value;
  if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요!");
  if (!idChecked || lastCheckedId !== id) return alert("아이디 중복확인을 해주세요!");

  fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password: pw }),
  })
    .then(res => res.json())
    .then(result => {
      if (result.result) {
        alert("회원가입 성공! 로그인하세요.");
        showPage("login-page");
      } else {
        alert("회원가입 실패(중복 또는 오류)");
      }
    })
    .catch(() => alert("서버 오류"));
}

// 로그아웃
function logout() {
  fetch("/api/logout", { method: "POST" })
    .then(res => res.text())
    .then(() => {
      alert("로그아웃 되었습니다.");
      showPage("login-page");
    });
}

// 자동 로그인 확인은 서버에 /api/me 만들어야 가능함 (선택)
