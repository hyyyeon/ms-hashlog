// ----------------- 화면 전환 함수 -----------------
function showSignup() {
  document.getElementById('signup').style.display = 'block';
  document.getElementById('login').style.display = 'none';
  document.getElementById('home').style.display = 'none';
}
function showLogin() {
  document.getElementById('signup').style.display = 'none';
  document.getElementById('login').style.display = 'block';
  document.getElementById('home').style.display = 'none';
}
function showHome() {
  document.getElementById('signup').style.display = 'none';
  document.getElementById('login').style.display = 'none';
  document.getElementById('home').style.display = 'block';
}

// ---------------- 세션 확인 (페이지 로드) -----------------
window.onload = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/me');  // 로그인 유지 확인 API 호출
  xhr.onload = function() {
    if (xhr.status === 200) {
    // 세션에 로그인 정보가 있으면 홈 화면으로 이동
      var user = JSON.parse(xhr.responseText);
      document.getElementById('name').innerText = user.name;
      showHome();
    } else {
      // 로그인 정보 없으면 로그인 화면으로 이동
      showLogin();
    }
  };
  xhr.send(); // 서버에 요청 전송
};

// ----------------- 회원가입 -----------------
function signup() {
  var id = document.getElementById('signup-id').value;
  var pw = document.getElementById('signup-pw').value;
  if (!id || !pw) {
    alert('입력해주세요');
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/signup');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    alert(xhr.responseText);
    if (xhr.status === 200) showLogin(); // 성공 시 로그인 화면으로 이동
  };
  xhr.send(JSON.stringify({ id: id, pw: pw, name: id }));
}

// ----------------- 로그인 -----------------
function login() {
  var id = document.getElementById('login-id').value;
  var pw = document.getElementById('login-pw').value;
  if (!id || !pw) {
    alert('입력해주세요');
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/login');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    alert(xhr.responseText);
    if (xhr.status === 200) {
      window.onload(); // 세션 재확인
    }
  };
  xhr.send(JSON.stringify({ id: id, pw: pw })); // 데이터 전송
}

// ----------------- 로그아웃 -----------------
function logout() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/logout');
  xhr.onload = function() {
    alert(xhr.responseText);
    showLogin();
  };
  xhr.send();
}

// ================== 클래스 기반 피라미드 ==================
class Pyramid {
  constructor(h) {
    this.h = h; // 피라미드 높이 저장
  }

  build() {
    var output = '';
    for (var i = 0; i < this.h; i++) {
      // 공백 처리
      for (var p = this.h; p > i + 1; p--) {
        output += ' ';
      }
      // 별 출력
      for (var j = 0; j < i * 2 + 1; j++) {
        output += '*';
      }
      output += '\n';
    }
    document.getElementById('result').textContent = output;
  }
}

function createPyramid() {
  var height = parseInt(document.getElementById('height').value, 10);
  var pyramid = new Pyramid(height); 
  pyramid.build(); // 피라미드 생성
}
