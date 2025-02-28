
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

async function sendKakaoHandler() {
  try {
    const docRef = doc(db, "회원가입계약서", window.docId);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    const 계약서사본 = userData.imageUrl ? userData.imageUrl.replace('https://', '') : '';

    const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'apikey': 'lcrmiph2rvyuaqiq1qp3lbs332di0x95',
        'userid': 'bodystar',
        'senderkey': 'b4c886fa9bd3cbf1faddb759fa6532867844ef03',
        'tpl_code': 'TY_3618',
        'sender': '01092792273',
        'receiver_1': '01086871992',
        'subject_1': '계약서',
        'message_1': `계약알림\n계약서가 도착하였습니다.\n\n`
          + `#{계약서} 도착!\n\n`
          + `[${userData.branch}, ${userData.contract_manager}]\n`
          + `□ ${userData.docId} / ${userData.gender} / ${userData.birthdate}\n`
          + `□ 회원권: ${userData.membership}, ${userData.membership_months}\n`
          + `□ 운동복대여: ${userData.rental_months}\n`
          + `□ 라커대여: ${userData.locker_months}\n`
          + `□ 총금액: ${userData.totalAmount}\n`
          + `□ 할인: ${userData.discount}\n`
          + `□ 결제예정: ${userData.unpaidAmount}\n`
          + `□ 운동목적: ${userData.goals}\n`
          + `□ 운동시간: ${userData.workout_times}\n`
          + `□ 가입경로: ${userData.referral_sources}\n`
          + `□ 회원권시작일: ${userData.membership_start_date}\n\n`
          + `계약서 바로가기\n`
          + `영수증 바로가기`,
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
            },
            {
              "name": "영수증 바로가기",
              "linkType": "WL",
              "linkTypeName": "웹링크",
              "linkPc": "https://${영수증사본}",
              "linkMo": "https://${영수증사본}"
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
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  const sendManagerButton = document.getElementById('sendManager');
  if (sendManagerButton) {
    sendManagerButton.addEventListener('click', sendKakaoHandler);
    sendManagerButton.addEventListener('touchstart', sendKakaoHandler);
  }
});
