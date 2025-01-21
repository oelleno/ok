const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'join.jpeg';

const signatureCanvas = document.getElementById('signatureCanvas');
const signatureCtx = signatureCanvas.getContext('2d');

let drawing = false;

// 이미지 로드 후 캔버스 설정
img.onload = () => {
    resizeCanvas();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // 이미지가 캔버스에 꽉 차게 표시
    setupInputFields();
};

window.addEventListener('resize', () => { // 브라우저 창의 크기가 변경될 때마다 크기 조정
    resizeCanvas(); // 캔버스 크기 조정
    setupInputFields(); // 입력 필드 및 서명 박스 위치 재조정
});

function resizeCanvas() {
    const aspectRatio = img.width / img.height; // 이미지의 가로 세로 비율 계산
    if (window.innerWidth / window.innerHeight > aspectRatio) {
        canvas.width = window.innerHeight * aspectRatio; // 높이에 맞춰 너비 조정
        canvas.height = window.innerHeight; // 높이 조정
    } else {
        canvas.width = window.innerWidth; // 너비에 맞춰 너비 조정
        canvas.height = window.innerWidth / aspectRatio; // 너비에 맞춰 높이 조정
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    setupInputFields(); // 브라우저 창의 크기에 따라 입력 필드 위치 재조정
}

function setupInputFields() { // 입력 필드 위치 재조정
    const nameField = document.getElementById('nameField'); // 요소 선택
    nameField.style.width = `${canvas.width * 0.15}px`;
    nameField.style.top = `${canvas.height * 0.113}px`;
    nameField.style.left = `${canvas.width * 0.1}px`;
    nameField.style.fontSize = `${canvas.height * 0.015}px`;

    const checkbox = document.getElementById('checkbox1');
    checkbox.style.top = `${canvas.height * 0.32}px`;
    checkbox.style.left = `${canvas.width * 0.06}px`;
    checkbox.style.width = checkbox.style.height = `${canvas.height * 0.02}px`;

    const submitButton = document.getElementById('submitButton');
    submitButton.style.top = `${canvas.height * 0.95}px`;
    submitButton.style.left = `${canvas.width * 0.1}px`;
    submitButton.style.fontSize = `${canvas.height * 0.02}px`;

    const signatureBox = document.getElementById('signatureArea'); // 요소 선택
    const canvasRect = canvas.getBoundingClientRect(); // 캔버스의 현재 위치와 크기 가져오기
    signatureBox.style.top = `${canvasRect.bottom - (canvasRect.height * 0.055)}px`; // 캔버스 하단에서 위치
    signatureBox.style.left = `${canvasRect.left + (canvasRect.width * 0.76)}px`; // 캔버스 왼쪽에서 위치
    signatureBox.style.width = `${canvasRect.height * 0.15}px`; // 캔버스 높이의 %로 설정
    signatureBox.style.height = `${canvasRect.height * 0.048}px`; // 캔버스 높이의 %로 설정
}

// 서명 그리기 관련 코드
signatureCanvas.addEventListener('mousedown', startDrawing);
signatureCanvas.addEventListener('mouseup', stopDrawing);
signatureCanvas.addEventListener('mousemove', draw);
signatureCanvas.addEventListener('touchstart', startDrawing);
signatureCanvas.addEventListener('touchend', stopDrawing);
signatureCanvas.addEventListener('touchmove', draw);

function startDrawing(event) {
    drawing = true;
    draw(event);
}

function stopDrawing() {
    drawing = false;
    signatureCtx.beginPath();
}

function draw(event) {
    if (!drawing) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;

    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.strokeStyle = 'blue'; // 서명 색상

    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
}

// 제출 버튼 클릭 시 동작
document.getElementById('submitButton').addEventListener('click', () => {
    const name = document.getElementById('nameField').value;

    // 캔버스에 텍스트 추가
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // 이미지 다시 그리기
    ctx.font = `${canvas.height * 0.02}px Arial`;
    ctx.fillStyle = 'blue'; // 텍스트 색상

    // 입력 필드의 위치를 기준으로 텍스트 위치 설정
    const nameFieldRect = document.getElementById('nameField').getBoundingClientRect();
    const nameX = nameFieldRect.left - canvas.getBoundingClientRect().left; // 캔버스 내 위치 계산
    const nameY = nameFieldRect.top - canvas.getBoundingClientRect().top + (nameFieldRect.height * 0.8); // 텍스트 높이 조정

    ctx.fillText(name, nameX, nameY); // 입력 필드 위치에 텍스트 추가


    // 서명 추가
    const signatureData = signatureCanvas.toDataURL();
    const signatureImg = new Image();
    signatureImg.src = signatureData;
    signatureImg.onload = () => {
        const signatureFieldRect = signatureCanvas.getBoundingClientRect();
        const signatureX = signatureFieldRect.left - canvas.getBoundingClientRect().left; // 서명 위치 조정
        const signatureY = signatureFieldRect.top - canvas.getBoundingClientRect().top; // 서명 위치 조정
        ctx.drawImage(signatureImg, signatureX, signatureY); // 서명 위치 조정

        // 다운로드 팝업
        const link = document.createElement('a');
        link.download = '텍스트필드1.png';
        link.href = canvas.toDataURL();
        link.click();
    };
});
