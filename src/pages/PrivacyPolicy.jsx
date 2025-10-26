import React from 'react';

// 이용약관과 동일한 스타일 객체
const styles = {
  container: {
    padding: '20px', 
    color: '#333333',
    textAlign: 'left',
  },
  h1: {
    fontSize: '28px',
    fontWeight: '700',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
    marginBottom: '30px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: 700,
    marginTop: '40px',
    marginBottom: '15px',
  },
  h3: { // 하위 제목 (예: 1. 자체 계정 회원가입 시)을 위한 스타일
    fontSize: '17px',
    fontWeight: '700',
    marginTop: '20px',
    marginBottom: '10px',
    color: '#444444',
  },
  p: {
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '15px',
  },
  ol: {
    paddingLeft: '30px',
    marginBottom: '15px',
  },
  li: {
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '10px',
  },
  ul: {
    paddingLeft: '30px',
    marginTop: '10px',
    listStyleType: 'disc',
  },
  footerText: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  }
};


const PrivacyPolicy = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>dayf 개인정보처리방침</h1>

      <p style={styles.p}>
        dayf는 "회원"의 개인정보를 중요시하며, 다음과 같이 개인정보를 수집 및 이용하고 있습니다.
      </p>
      <p style={styles.p}>
        본 방침은 2025년 10월 26일부터 시행됩니다.
      </p>

      <h2 style={styles.h2}>제1조 (수집하는 개인정보 항목 및 수집방법)</h2>
      <p style={styles.p}>
        "회사"는 회원가입, 서비스 이용, 구글 캘린더 연동 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
      </p>
      
      <h3 style={styles.h3}>1. 자체 계정 회원가입 시</h3>
      <ul style={styles.ul}>
        <li style={styles.li}>필수 항목 : 아이디, 이름, 비밀번호 (비밀번호는 암호화되어 저장)</li>
        <li style={styles.li}>수집 방법 : "서비스" 회원가입 화면에서 "회원"이 직접 입력</li>
      </ul>

      <h3 style={styles.h3}>2. 구글 소셜 로그인 이용 시</h3>
      <ul style={styles.ul}>
        <li style={styles.li}>필수 항목 : 구글이 제공하는 식별자(ID), 이메일, 이름 (구글의 정책에 따라 제공되는 범위)</li>
        <li style={styles.li}>수집 방법 : 구글 소셜 로그인(OAuth) 동의 시 구글로부터 제공받음</li>
      </ul>

      <h3 style={styles.h3}>3. 구글 캘린더 연동 기능 이용 시</h3>
      <ul style={styles.ul}>
        <li style={styles.li}>수집 항목 : 구글 캘린더 접근 권한(OAuth Token)</li>
        <li style={styles.li}>수집 방법 : "회원"이 "서비스" 내 '구글 캘린더 연동하기' 기능 실행 시 명시적인 동의를 통해 수집</li>
      </ul>


      <h2 style={styles.h2}>제2조 (개인정보의 수집 및 이용 목적)</h2>
      <p style={styles.p}>
        "회사"는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
      </p>
      <ul style={styles.ul}>
        <li style={styles.li}>서비스 제공 및 회원 관리 : 회원제 서비스 이용에 따른 본인 식별, 불량회원의 부정 이용 방지, 가입 의사 확인, 민원 처리</li>
        <li style={styles.li}>구글 캘린더 연동 : "회원"이 "서비스"에서 생성한 교대근무 일정을 "회원" 본인의 구글 캘린더에 저장(Create)하거나 삭제(Delete)하기 위한 목적. (최대 12개월 분량의 일정)</li>
      </ul>

      <h2 style={styles.h2}>제3조 (개인정보의 보유 및 이용기간)</h2>
      <p style={styles.p}>
        "회사"는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, "회원"의 회원 탈퇴 시 수집된 모든 정보(아이디, 이름 등)는 영구적으로 즉시 삭제됩니다.
      </p>
      {/* <p style={styles.p}>
          (법령상 보관 의무가 있다면 기재, 예: 전자상거래법상 계약/청약철회 기록 5년 등. 교대근무 앱은 해당 없을 가능성이 높으므로, "원칙적 즉시 파기"가 맞을 수 있습니다.)
        </p>
      */}

      <h2 style={styles.h2}>제4조 (개인정보의 파기절차 및 방법)</h2>
      <p style={styles.p}>
        "회사"는 원칙적으로 개인정보 보유기간의 경과, 처리목적 달성 등 그 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
      </p>
      <ul style={styles.ul}>
        <li style={styles.li}>파기절차 : "회원"이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후(회원 탈퇴 시) 즉시 파기됩니다.</li>
        <li style={styles.li}>파기방법 : 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하여 파기합니다.</li>
      </ul>

      <h2 style={styles.h2}>제5조 (개인정보의 제3자 제공)</h2>
      <p style={styles.p}>
        "회사"는 "회원"의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
      </p>
      <ul style={styles.ul}>
        <li style={styles.li}>"회원"이 사전에 동의한 경우</li>
        <li style={styles.li}>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
      </ul>

      <h2 style={styles.h2}>제6조 (수집한 개인정보의 위탁)</h2>
      <p style={styles.p}>
        "회사"는 "서비스" 이행을 위해 아래와 같이 외부 전문업체에 위탁하여 운영하고 있습니다. 
      </p>
      <ul style={styles.ul}>
        <li style={styles.li}>위탁 대상자 : Amazon Web Services, Inc.</li>
        <li style={styles.li}>위탁업무 내용 : "서비스" 데이터 보관 및 시스템 운영</li>
        {/* <li style={styles.li}>(만약 위탁하는 업체가 없다면 "해당 사항 없음"으로 기재)</li> */}
      </ul>

      <h2 style={styles.h2}>제7조 (Google API 서비스로부터 수신된 정보의 이용)</h2>
      <p style={styles.p}>
        "회사"는 Google API 서비스로부터 받은 정보를 이용 및 전송함에 있어, Google API 서비스 사용자 데이터 정책(Google API Services User Data Policy)의 '제한된 사용(Limited Use)' 요구사항을 준수합니다.
      </p>
      <ul style={styles.ul}>
        <li style={styles.li}>접근 범위 : "회사"는 "회원"의 명시적 동의 하에 구글 캘린더 API (https://www.googleapis.com/auth/calendar.events) 범위의 접근 권한을 요청합니다.</li>
        <li style={styles.li}>이용 목적 : 이 권한은 "회원"이 "서비스" 내에서 생성한 교대근무 일정을 "회원" 본인의 구글 캘린더에 [저장(Create)]하고, "서비스"를 통해 저장했던 일정을 [삭제(Delete)]하는 기능을 제공하기 위한 목적으로만 사용됩니다.</li>
        <li style={styles.li}>정보의 전송 : "회사"는 "회원"의 구글 캘린더 데이터를 읽거나(Read), 기존 일정을 수정하거나(Update), 타인 또는 다른 앱(App)에게 전송하거나 공유하지 않습니다.</li>
        <li style={styles.li}>정보의 저장 : "회사"는 "회원"의 구글 캘린더 접근 권한(OAuth Token) 외에 "회원"의 구글 캘린더에 저장된 어떠한 데이터도 "회사"의 서버에 저장하지 않습니다.</li>
      </ul>

      <h2 style={styles.h2}>제8조 (정보주체(회원)의 권리·의무 및 행사방법)</h2>
      <ul style={styles.ul}>
        <li style={styles.li}>"회원"은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 회원 탈퇴를 요청할 수도 있습니다.</li>
        <li style={styles.li}>개인정보 조회/수정을 위해서는 '개인정보변경'(또는 '회원정보수정')을, 회원 탈퇴를 위해서는 '회원탈퇴' 기능을 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.</li>
        <li style={styles.li}>혹은 개인정보 보호 책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</li>
      </ul>

      <h2 style={styles.h2}>제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h2>
      <p style={styles.p}>
        "회사"는 "서비스" 운영에 필요한 최소한의 범위(예: 로그인 상태 유지)에서 '쿠키(cookie)' 등을 운용할 수 있습니다. "회원"은 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.
      </p>

      <h2 style={styles.h2}>제10조 (개인정보 보호 책임자)</h2>
      <p style={styles.p}>
        "회사"는 "회원"의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보 보호 책임자를 지정하고 있습니다.
      </p>
      <div style={{ ...styles.p, padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <strong>[개인정보 보호 책임자]</strong><br />
        이름 : 문소연<br />
        소속/직책 : 운영자<br />
        이메일 : soyeon5447@gmail.com<br />
      </div>
      <p style={styles.p}>
        "회원"은 "서비스"를 이용하시며 발생하는 모든 개인정보보호 관련 민원을 개인정보 보호 책임자 혹은 담당 부서로 신고하실 수 있습니다.
      </p>
      <h2 style={styles.h2}>제11조 (고지의 의무)</h2>
      <p style={styles.p}>
        현 개인정보처리방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 "서비스" 내 공지사항을 통하여 고지할 것입니다.
      </p>

    </div>
  );
};

export default PrivacyPolicy;