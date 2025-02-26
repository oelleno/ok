import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyP5QTMzBtz8lMEzkE4C66CjFbZ3a17QM",
  authDomain: "bodystar-1b77d.firebaseapp.com",
  projectId: "bodystar-1b77d",
  storageBucket: "bodystar-1b77d.firebasestorage.app",
  messagingSenderId: "1011822927832",
  appId: "1:1011822927832:web:87f0d859b3baf1d8e21cad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


document.getElementById('sendKakao').addEventListener('click', async () => {
   try {
    const docRef = doc(db, "회원가입계약서", window.docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('계약서를 찾을 수 없습니다.');
    }

    const userData = docSnap.data();
    const 회사명 = '바디스타';
    const 고객명 = userData.name;
    const 계약서사본 = userData.imageUrl.replace('https://', '');

    const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'apikey': 'lcrmiph2rvyuaqiq1qp3lbs332di0x95',
        'userid': 'bodystar',
        'senderkey': 'b4c886fa9bd3cbf1faddb759fa6532867844ef03',
        'tpl_code': 'TY_1680',
        'sender': '01092792273',
        'receiver_1': userData.contact,
        'subject_1': '계약서',
        'message_1': `[${회사명}]\n안녕하세요. ${고객명}님!\n${회사명}에 등록해주셔서 진심으로 감사드립니다!`,
        'button_1': `{
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
              "linkPc": "https://${계약서사본}",
              "linkMo": "https://${계약서사본}"
            }
          ]
        }`,
        'failover': 'N'
      })
    });

    const result = await response.json();
    console.log('카카오 알림톡 전송 결과:', result);
    if (result.code === 0 && result.message === '성공적으로 전송요청 하였습니다.') {
      window.dispatchEvent(new Event('kakaoSendSuccess'));
    }
    alert('알림톡이 전송되었습니다.');
  } catch (error) {
    console.error('카카오 알림톡 전송 실패:', error);
    alert('알림톡 전송에 실패했습니다.');
  }
});

// 📌 click & touch 이벤트 추가
document.getElementById('sendKakao').addEventListener('click', sendKakaoHandler);
document.getElementById('sendKakao').addEventListener('touchstart', sendKakaoHandler);
