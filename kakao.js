
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "./firebase.js";

// 📌 Phone verification
const sendVerificationCode = async () => {
  const phone = document.getElementById('phone').value;
  if (!phone) return;

  const authCode = Math.floor(100000 + Math.random() * 900000);
  const 회사명 = '바디스타';

  const params = new URLSearchParams({
    'apikey': 'lcrmiph2rvyuaqiq1qp3lbs332di0x95',
    'userid': 'bodystar',
    'senderkey': 'b4c886fa9bd3cbf1faddb759fa6532867844ef03',
    'tpl_code': 'TY_3472',
    'sender': '01092792273',
    'receiver_1': phone,
    'subject_1': '인증번호발송',
    'message_1': `[${회사명}] 본인 확인을 위한 인증번호는 ${authCode}입니다.`,
  });

  try {
    const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: params
    });

    const data = await response.json();
    if (data.result_code === "1" || data.message === "성공적으로 전송요청 하였습니다.") {
      document.getElementById('verification-code-section').style.display = 'block';
      document.getElementById('phone-section').style.display = 'none';
      document.getElementById('admin-button').style.display = 'none';
      window.authCode = authCode;
      alert("인증번호가 발송되었습니다.");
    } else {
      alert(`인증번호 전송 실패: ${data.message}`);
    }
  } catch (error) {
    console.error('인증번호 전송 오류:', error);
    alert('인증번호 전송 실패');
  }
};

const verifyCode = () => {
  const code = document.getElementById('verification-code').value;
  if (!code) return;

  if (code === window.authCode.toString()) {
    const phoneNumber = document.getElementById('phone').value;
    const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    localStorage.setItem('verifiedPhone', formattedPhone);

    document.getElementById('phone-section').style.display = 'none';
    document.getElementById('verification-code-section').style.display = 'none';
    document.getElementById('verification-success').style.display = 'block';

    setTimeout(() => {
      document.getElementById('verification-section').style.display = 'none';
      document.getElementById('admin-section').style.display = 'block';
    }, 1500);
  } else {
    alert('잘못된 인증번호입니다.');
  }
};

// 📌 Kakao Message
document.getElementById('sendKakao').addEventListener('click', async () => {
  const phone = document.getElementById('phone').value;
  try {
    const docRef = doc(db, "회원가입계약서", window.docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('계약서를 찾을 수 없습니다.');
    }

    const userData = docSnap.data();
    const message = {
      'apikey': 'lcrmiph2rvyuaqiq1qp3lbs332di0x95',
      'userid': 'bodystar',
      'senderkey': 'b4c886fa9bd3cbf1faddb759fa6532867844ef03',
      'tpl_code': 'TY_1680',
      'sender': '01092792273',
      'receiver_1': phone,
      'subject_1': '계약서',
      'message_1': `[바디스타]\n안녕하세요. ${userData.name}님!\n바디스타에 등록해주셔서 진심으로 감사드립니다!`,
      'button_1': JSON.stringify({
        "button": [
          {
            "name": "채널추가",
            "linkType": "AC",
            "linkTypeName": "채널 추가"
          },
          {
            "name": "계약서 바로가기",
            "linkType": "WL",
            "linkTypeName": "웹링크",
            "linkPc": `https://${userData.imageUrl}`,
            "linkMo": `https://${userData.imageUrl}`
          }
        ]
      }),
      'failover': 'N'
    };

    const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams(message)
    });

    const data = await response.json();
    console.log('전송 결과:', data);
    alert(data.message || '알림톡이 전송되었습니다.');
  } catch (error) {
    console.error('전송 오류:', error);
    alert('전송 중 오류가 발생했습니다.');
  }
});

export { sendVerificationCode, verifyCode };
