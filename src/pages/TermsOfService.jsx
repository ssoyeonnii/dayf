import React from 'react';

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
  p: {
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '15px',
  },
  ol: {
    paddingLeft: '30px', // 리스트 들여쓰기
    marginBottom: '15px',
  },
  li: {
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '10px', // 리스트 항목 간 여백
  },
  ul: {
    paddingLeft: '30px',
    marginTop: '10px',
    listStyleType: 'disc', // 불릿 스타일
  },
  footerText: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0', // 상단 구분선
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  }
};


const TermsOfService = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>dayf 이용약관</h1>

      <h2 style={styles.h2}>제1조 (목적)</h2>
      <p style={styles.p}>
        본 약관은 dayf (이하 "회사")가 제공하는 교대근무 일정 관리 서비스 'dayf' (이하 "서비스")의 이용과 관련하여 "회사"와 "회원" 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
      </p>

      <h2 style={styles.h2}>제2조 (용어의 정의)</h2>
         <p style={styles.p}>"서비스"라 함은 "회원"이 자신의 교대근무 일정을 생성, 관리하고, "회원"의 선택에 따라 구글 캘린더에 연동할 수 있도록 "회사"가 제공하는 dayf 웹 서비스를 의미합니다.</p>
         <p style={styles.p}>"회원"이라 함은 본 약관에 동의하고 "서비스" 이용 자격을 부여받은 자를 의미합니다.</p>
         <p style={styles.p}>"자체 계정"이라 함은 "서비스"가 제공하는 방식에 따라 "회원"이 직접 생성한 아이디(ID)와 비밀번호를 이용하는 계정을 의미합니다.</p>
         <p style={styles.p}>"소셜 계정"이라 함은 "회원"이 Google 등 외부 서비스의 인증 정보를 이용하여 "서비스"에 로그인하는 계정을 의미합니다.</p>

      <h2 style={styles.h2}>제3조 (약관의 게시와 개정)</h2>
      
         <p style={styles.p}>"회사"는 본 약관의 내용을 "회원"이 쉽게 알 수 있도록 "서비스" 초기 화면 또는 연결 화면에 게시합니다.</p>
         <p style={styles.p}>"회사"는 필요하다고 인정되는 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
         <p style={styles.p}>약관이 개정되는 경우, "회사"는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</p>
      

      <h2 style={styles.h2}>제4조 (회원가입)</h2>
      
        <p style={styles.p}>회원가입은 "서비스"를 이용하려는 자(이하 "가입신청자")가 약관의 내용에 동의를 한 다음, "자체 계정" 또는 "소셜 계정" 방식을 통해 회원가입 신청을 하고 "회사"가 이러한 신청을 승낙함으로써 완료됩니다.</p>
        <p style={styles.p}>"자체 계정" 가입 시 "가입신청자"는 아이디, 이름, 비밀번호를 제공해야 합니다.</p>
        <p style={styles.p}>"회사"는 "가입신청자"의 신청에 대하여 "서비스" 이용을 승낙함을 원칙으로 합니다.</p>
      

      <h2 style={styles.h2}>제5조 (서비스의 제공 및 변경)</h2>
      
      <p style={styles.p}>"회사"는 "회원"에게 다음과 같은 "서비스"를 제공합니다.</p>
          <ul style={styles.ul}>
            <li style={styles.li}>교대근무 일정 생성 및 관리 기능</li>
            <li style={styles.li}>생성된 교대근무 일정의 구글 캘린더 연동(저장/삭제) 기능</li>
            <li style={styles.li}>기타 "회사"가 추가 개발하거나 제휴를 통해 "회원"에게 제공하는 일체의 기능</li>
          </ul>
        
         <p style={styles.p}>"회원"은 "자체 계정" 또는 "소셜 계정"을 통해 "서비스"에 로그인할 수 있습니다.</p>
         <p style={styles.p}>구글 캘린더 연동 기능은 "회원"의 명시적인 동의(OAuth 인증) 하에 작동하며, "회원"이 "서비스" 내에서 생성한 근무 일정에 한하여 "회원"의 구글 캘린더에 저장 및 삭제를 수행합니다.</p>
         <p style={styles.p}>구글 캘린더에 저장 가능한 일정의 최대 기간은 현재 시점으로부터 12개월까지로 제한됩니다.</p>
      
      
      <h2 style={styles.h2}>제6조 (회원의 의무)</h2>
      
         <p style={styles.p}>"회원"은 자신의 계정 정보(아이디, 비밀번호)를 선량한 관리자의 주의의무로 관리해야 하며, 이를 제3자가 이용하도록 허락할 수 없습니다.</p>
         <p style={styles.p}>"회원"은 "서비스" 이용과 관련하여 다음 각 호의 행위를 하여서는 안 됩니다.</p>
          <ul style={styles.ul}>
            <li style={styles.li}>타인의 정보를 도용하는 행위</li>
            <li style={styles.li}>"회사"의 "서비스" 운영을 고의로 방해하는 행위</li>
            <li style={styles.li}>관련 법령 또는 사회상규에 위배되는 행위</li>
          </ul>
  

      <h2 style={styles.h2}>제7조 (회원 탈퇴 및 자격 상실)</h2>
      
      <p style={styles.p}>"회원"은 언제든지 "서비스" 내 기능 또는 고객센터를 통해 회원 탈퇴를 요청할 수 있으며, "회사"는 관련 법령이 정하는 바에 따라 이를 즉시 처리합니다.</p>
      <p style={styles.p}>"회원"이 "서비스"에서 탈퇴하는 경우, "회사"는 제8조(개인정보처리방침)에 따라 "회원"의 정보를 처리합니다.</p>
    

      <h2 style={styles.h2}>제8조 (개인정보보호)</h2>
      <p style={styles.p}>
        "회사"는 "회원"의 개인정보를 보호하기 위해 [개인정보처리방침]을 수립하고 준수합니다.
      </p>

      <h2 style={styles.h2}>제9조 (면책조항)</h2>
      
        <p style={styles.p}>"회사"는 천재지변 또는 이에 준하는 불가항력으로 인하여 "서비스"를 제공할 수 없는 경우에는 "서비스" 제공에 관한 책임이 면제됩니다.</p>
        <p style={styles.p}>"회사"는 구글(Google) 등 외부 서비스 제공자의 귀책 사유로 인한 "서비스" 장애(예: 구글 캘린더 API 오류)에 대해서는 책임을 지지 않습니다.</p>
        <p style={styles.p}>"회사"는 "회원"의 귀책 사유로 인한 "서비스" 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
      

      <h2 style={styles.h2}>제10조 (준거법 및 재판관할)</h2>
      <p style={styles.p}>
        본 약관에 관하여 "회사"와 "회원" 간에 발생한 분쟁은 대한민국 법률을 준거법으로 하며, 이에 관한 소송은 민사소송법상의 관할 법원에 제기합니다.
      </p>

      <h2 style={{...styles.h2, marginTop: '50px' }}>부칙</h2>
      <p style={styles.p}>
        제1조 (시행일) 본 약관은 2025년 10월 26일부터 시행합니다.
      </p>
      
      <div style={styles.footerText}>
        <p style={{ margin: 0 }}>
          연락처: soyeon5447@gmail.com
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;