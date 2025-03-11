// 일일권 관련 자바스크립트 함수들

// 양식 제출 핸들러 함수
async function handleOnedaySubmit() {
  try {
    // 먼저 필수 항목 검증
    validateOnedayForm();

    // Firebase에 데이터 저장
    await submitOnedayForm();

    // 이미지 생성 및 다운로드
    downloadOnedayAsImage();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(error.message || "양식 제출 중 오류가 발생했습니다.");
  }
}

// 일일권 신청서를 이미지로 변환하고 다운로드하는 함수
function downloadOnedayAsImage() {
  const container = document.querySelector('.container');
  html2canvas(container, {
    backgroundColor: '#f5f5f5',
    scale: 1.0,
    useCORS: true
  }).then(canvas => {
    console.log("📸 이미지 변환 완료");

    // 현재 날짜를 YYMMDD 형식으로 가져오기
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = year + month + day;

    // 회원 이름 가져오기
    const memberName = document.getElementById('name').value;

    // Firebase 제출에서 docId 가져오기
    const dailyNumber = localStorage.getItem('current_doc_number');
    if (!dailyNumber) {
      console.error('Document number not found');
      return;
    }

    // Firebase 문서 번호를 사용하여 파일 이름 생성
    const fileName = `${dateStr}one_${dailyNumber}_${memberName}.jpg`; // 수정된 부분

    // 캔버스를 Blob으로 변환하고 Firebase Storage에 업로드
    canvas.toBlob(async (blob) => {
      try {
        // Firebase Storage에 이미지 업로드
        await window.uploadImage(fileName, blob);

        // 로컬 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
      }
    }, 'image/jpeg');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    `;
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 0 20px rgba(0,0,0,0.4);
      z-index: 1000;
      text-align: center;
      min-width: 300px;
      min-height: 180px;
      font-size: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;

    const statusText = document.createElement('h3');
    statusText.textContent = '신청서 업로드 중...';
    statusText.style.cssText = `
      margin-top: 0px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      white-space: nowrap; /* 줄바꿈 방지 */
    `;
    popup.appendChild(statusText);

    setTimeout(() => {
      statusText.textContent = '신청서 업로드 완료!';
      setTimeout(() => {
        statusText.textContent = '신청서URL 저장 완료!';
        setTimeout(() => {
          statusText.style.display = 'none';

          // Create button container for vertical layout
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
          `;

          // 영수증 저장 버튼 생성
          const receiptBtn = document.createElement('button');
          receiptBtn.textContent = '영수증 저장';
          receiptBtn.onclick = function() {
              if (!window.docId) {
                  alert('신청서 번호를 찾을 수 없습니다.');
                  return;
              }
              localStorage.setItem('receipt_doc_id', window.docId);
              localStorage.setItem('collection_name', 'Onedaypass'); // 컬렉션 이름 저장
              window.location.href = 'receipt.html';
          };
          receiptBtn.style.cssText = `
              padding: 10px 20px;
              background: #0078D7;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              font-size: 16px;
              width: 200px;
          `;

          // 버튼을 팝업에 추가
          buttonContainer.appendChild(receiptBtn);
          popup.appendChild(buttonContainer);

        }, 1000);
      }, 1000);
    }, 1000);

    document.body.appendChild(popup);
    console.log("🎉 팝업 생성 완료");

  }).catch(error => {
    console.error("❌ html2canvas 실행 중 오류 발생:", error);
  });
}

// 일일권용 유효성 검사 함수
function validateOnedayForm() {
  // 필수 입력 필드 목록
  const requiredFields = ['name', 'contact', 'branch'];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      throw new Error(`필수 항목(${fieldId === 'branch' ? '지점' : fieldId === 'name' ? '이름' : '연락처'})을 입력해주세요.`);
    }
  }

  // 약관 동의 확인
  const termsAgree = document.querySelector('input[name="terms_agree"]');
  if (!termsAgree || !termsAgree.checked) {
    throw new Error('이용약관에 동의해주세요.');
  }

  // 성별 선택 확인
  const gender = document.querySelector('input[name="gender"]:checked');
  if (!gender) {
    throw new Error('성별을 선택해주세요.');
  }

  // 결제방법 선택 확인
  const payment = document.querySelector('input[name="payment"]:checked');
  if (!payment) {
    throw new Error('결제방법을 선택해주세요.');
  }

  return true;
}

// 일일권 금액 계산 함수
function calculateTotal() {
  const price = parseInt(document.getElementById('price').value.replace(/[^\d]/g, '') || 22000);
  const discount = parseInt(document.getElementById('discount').value.replace(/[^\d]/g, '') || 0);
  const total = price - discount;
  document.getElementById('total_amount').value = '₩ ' + total.toLocaleString('ko-KR');
}

// 일일권 할인 팝업 함수
function showDiscountPopup() {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    z-index: 1000;
    min-width: 300px;
    font-size: 16px;
  `;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  `;

  // 팝업 제목 추가
  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = '<h4 style="margin-top: 0; margin-bottom: 15px; text-align: center;">할인 항목 입력</h4>';
  popup.appendChild(titleDiv);

  const discountContainer = document.createElement('div');
  discountContainer.id = 'discount-items';

  function addDiscountRow() {
    const row = document.createElement('div');
    row.style.marginBottom = '10px';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';

    const addBtn = document.createElement('button');
    addBtn.innerHTML = '+';
    addBtn.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: none;
      background: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    addBtn.onclick = function() { 
      addDiscountRow(); 
      updateDiscountSummary();
    };

    const select = document.createElement('select');
    select.style.cssText = 'padding: 5px; border-radius: 5px; font-size: 14px; width: 120px;';
    select.innerHTML = `
      <option value="">할인 항목 선택</option>
      <option value="운동복">운동복 할인</option>
      <option value="라커">라커 할인</option>
      <option value="회원권">회원권 할인</option>
      <option value="직접입력">직접입력</option>
    `;

    const itemInput = document.createElement('input');
    itemInput.type = 'text';
    itemInput.style.cssText = 'width: 120px; padding: 5px; border-radius: 5px; display: none; font-size: 14px;';
    itemInput.placeholder = '할인 항목 입력';

    select.onchange = function() {
      itemInput.style.display = this.value === '직접입력' ? 'block' : 'none';
    };

    const input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = 'width: 120px; padding: 5px; border-radius: 5px; font-size: 14px;';
    input.placeholder = '(₩)금액입력';
    input.setAttribute('inputmode', 'numeric');
    input.oninput = function() { 
      formatCurrency(this); 
      updateDiscountSummary();
    };
    input.onkeypress = function(e) {
      if (e.key === 'Enter') {
        confirmButton.click();
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: none;
      background: #ff4444;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    deleteBtn.onclick = function() {
      row.remove();
      updateDiscountSummary();
    };

    row.appendChild(addBtn);
    row.appendChild(select);
    row.appendChild(itemInput);
    row.appendChild(input);
    row.appendChild(deleteBtn);
    discountContainer.appendChild(row);
  }

  // 할인 요약 표시 영역 추가
  const summaryDiv = document.createElement('div');
  summaryDiv.id = 'discount-summary';
  summaryDiv.style.cssText = `
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 5px;
    border: 1px solid #dee2e6;
    font-size: 14px;
  `;
  summaryDiv.innerHTML = '<div>할인 금액 합계: ₩ 0</div>';

  // 할인 요약 업데이트 함수
  function updateDiscountSummary() {
    let total = 0;
    const summaryItems = [];

    discountContainer.querySelectorAll('div').forEach(row => {
      const select = row.querySelector('select');
      const itemInput = row.querySelector('input[placeholder="할인 항목 입력"]');
      const amountInput = row.querySelector('input[placeholder="(₩)금액입력"]');

      if (select && amountInput && amountInput.value) {
        const itemName = select.value === '직접입력' ? (itemInput.value || '기타 할인') : select.value;
        const amount = parseInt(amountInput.value.replace(/[^\d]/g, '')) || 0;

        if (amount > 0) {
          total += amount;
          summaryItems.push(`${itemName}: ₩ ${amount.toLocaleString('ko-KR')}`);
        }
      }
    });

    let summaryHTML = '';
    if (summaryItems.length > 0) {
      summaryHTML = summaryItems.join('<br>') + 
        `<div style="margin-top: 8px; border-top: 1px solid #ccc; padding-top: 8px;"><strong>할인 합계: ₩ ${total.toLocaleString('ko-KR')}</strong></div>`;
    } else {
      summaryHTML = '<div>할인 금액 합계: ₩ 0</div>';
    }

    summaryDiv.innerHTML = summaryHTML;
    return total;
  }

  const confirmButton = document.createElement('button');
  confirmButton.textContent = '확인';
  confirmButton.style.cssText = `
    padding: 8px 15px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    width: 100%;
    margin-top: 15px;
  `;

  confirmButton.onclick = function() {
    const total = updateDiscountSummary();

    const discountInput = document.getElementById('discount');
    discountInput.value = total.toLocaleString('ko-KR');
    calculateTotal();

    // 팝업 닫기
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  };

  popup.appendChild(discountContainer);
  popup.appendChild(summaryDiv);
  popup.appendChild(confirmButton);

  // 모달 닫기 - overlay 클릭시
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      document.body.removeChild(popup);
    }
  });

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  addDiscountRow(); // Add first row by default
}

// 전화번호 포맷팅 함수
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, ''); // 숫자만 남기기

  if (value.length >= 11) {
    value = value.substring(0, 11); // 최대 11자리로 제한
    value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (value.length > 7) {
    value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
  }

  input.value = value; // 변환된 값 설정
}

// 문서 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 금액 입력 필드 초기화
  const priceInput = document.getElementById('price');
  if (priceInput) {
    priceInput.readOnly = true;
    priceInput.style.backgroundColor = '#f5f5f5';
  }

  // 할인 입력 필드 초기화
  const discountInput = document.getElementById('discount');
  if (discountInput) {
    discountInput.addEventListener('click', showDiscountPopup);
    discountInput.readOnly = true;
  }

  // 초기 합계 계산
  calculateTotal();

  // 현금영수증 관련 필드 처리
  const cashReceiptRadios = document.querySelectorAll('input[name="cash_receipt"]');
  const receiptPhoneField = document.getElementById('receipt_phone');

  if (cashReceiptRadios.length > 0 && receiptPhoneField) {
    cashReceiptRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'O') {
          receiptPhoneField.disabled = false;
          receiptPhoneField.style.backgroundColor = '';
        } else {
          receiptPhoneField.disabled = true;
          receiptPhoneField.style.backgroundColor = '#f5f5f5';
          receiptPhoneField.value = '';
        }
      });
    });

    // 초기 상태 설정
    receiptPhoneField.disabled = true;
    receiptPhoneField.style.backgroundColor = '#f5f5f5';
  }

  // SNS 필드 처리
  const snsCheckbox = document.querySelector('input[name="referral"][value="SNS"]');
  const snsField = document.getElementById('snsField');

  if (snsCheckbox && snsField) {
    snsField.style.display = 'none';
    snsCheckbox.addEventListener('change', function() {
      snsField.style.display = this.checked ? 'block' : 'none';
    });
  }
});

// 전역 함수로 내보내기
window.handleOnedaySubmit = handleOnedaySubmit;
window.validateOnedayForm = validateOnedayForm;
window.calculateTotal = calculateTotal;
window.showDiscountPopup = showDiscountPopup;
window.formatPhoneNumber = formatPhoneNumber;