// 時代少年團 9宮格拼圖問答遊戲 - sketch.js (拼圖底框凹凸 + 即時對錯反饋版)

const tntQuestionBank = [
  { q: "時代少年團（Teens in Times）的隊長是誰？", options: ["丁程鑫", "馬嘉祺", "宋亞軒", "劉耀文"], ans: 1 },
  { q: "時代少年團共有幾位成員？", options: ["5位", "6位", "7位", "8位"], ans: 2 },
  { q: "團體中年紀最小（最小弟弟）的成員是誰？", options: ["嚴浩翔", "賀峻霖", "劉耀文", "宋亞軒"], ans: 2 },
  { q: "成員丁程鑫在隊內的常規暱稱/稱呼是什麼？", options: ["丁哥 / 阿程", "小馬哥", "軒軒", "小熊"], ans: 0 },
  { q: "時代少年團於哪一年正式出道？", options: ["2018年", "2019年", "2020年", "2021年"], ans: 1 },
  { q: "成員宋亞軒以招牌笑容和優秀歌藝著稱，他的代表動物形象通常是？", options: ["小狗 / 魚", "狼", "小熊", "兔子"], ans: 0 },
  { q: "團內擔當 Rap 且有「嚴總」稱號的成員是誰？", options: ["張真源", "嚴浩翔", "賀峻霖", "劉耀文"], ans: 1 },
  { q: "成員張真源以溫柔沉穩、唱功優異著稱，他的代表動物形象是？", options: ["松鼠", "大象 / 溫柔小熊", "狐狸", "小貓"], ans: 1 },
  { q: "成員賀峻霖主持能力極佳、反應靈敏，他的代表動物形象通常是？", options: ["小兔", "小狗", "小狼", "小猴"], ans: 0 },
  { q: "時代少年團的官方粉絲名稱是什麼？", options: ["四葉草", "爆米花", "小金剛", "小星光"], ans: 1 },
  { q: "時代少年團的出道曲是哪一首？", options: ["《全校通報》", "《爆米花》", "《姐姐真漂亮》", "《要你管》"], ans: 0 },
  { q: "歌曲《要你管》傳達的精神主要是？", options: ["做真實的自己，不懼外界眼光", "描繪校園浪漫", "感恩父母", "懷念童年"], ans: 0 }
];

let questions = [];
let pieces = [];
let gridEdges = [];

let activeModal = null; // 當前開啟題目的拼圖索引
let modalAnswerState = null; // { userChoice: index, isCorrect: boolean }
let activePiece = null; 
let dragOffsetX = 0, dragOffsetY = 0;
let isFinished = false;

// 9 宮格主題色彩與名稱（解鎖後呈現）
const pieceThemes = [
  { name: "馬嘉祺", color: [239, 68, 68] },
  { name: "丁程鑫", color: [249, 115, 22] },
  { name: "宋亞軒", color: [234, 179, 8] },
  { name: "劉耀文", color: [34, 197, 94] },
  { name: "張真源", color: [6, 182, 212] },
  { name: "嚴浩翔", color: [59, 130, 246] },
  { name: "賀峻霖", color: [168, 85, 247] },
  { name: "TNT 團體", color: [236, 72, 153] },
  { name: "未來加油", color: [100, 116, 139] }
];

function setup() {
  let canvas = createCanvas(1000, 680);
  canvas.parent(document.body);
  initGame();
}

function initGame() {
  isFinished = false;
  activeModal = null;
  modalAnswerState = null;
  activePiece = null;

  // 1. 隨機抽選 9 題
  let shuffled = [...tntQuestionBank].sort(() => Math.random() - 0.5);
  questions = shuffled.slice(0, 9);

  // 2. 生成 3x3 相鄰邊互補 (1: 凸, -1: 凹, 0: 平邊)
  generateGridEdges();

  let boardX = 40;
  let boardY = 120;
  let pieceSize = 150;

  pieces = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let idx = r * 3 + c;
      let targetX = boardX + c * pieceSize;
      let targetY = boardY + r * pieceSize;

      let randomX = 550 + (c * 120) + random(-15, 15);
      let randomY = 140 + (r * 150) + random(-15, 15);

      pieces.push({
        id: idx,
        row: r,
        col: c,
        x: randomX,
        y: randomY,
        targetX: targetX,
        targetY: targetY,
        edges: gridEdges[r][c],
        isUnlocked: false,
        isCorrect: false,
        isPlaced: false,
        question: questions[idx],
        theme: pieceThemes[idx]
      });
    }
  }
}

// 生成 3x3 網格邊緣：確保相鄰邊一凸(1)一凹(-1)
function generateGridEdges() {
  gridEdges = Array(3).fill().map(() => Array(3).fill().map(() => ({ top: 0, right: 0, bottom: 0, left: 0 })));

  // 水平相鄰邊
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      let val = random() > 0.5 ? 1 : -1;
      gridEdges[r][c].right = val;
      gridEdges[r][c + 1].left = -val;
    }
  }

  // 垂直相鄰邊
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      let val = random() > 0.5 ? 1 : -1;
      gridEdges[r][c].bottom = val;
      gridEdges[r + 1][c].top = -val;
    }
  }
}

function draw() {
  background(245, 247, 250);

  // 標題說明
  fill(40, 50, 70);
  textSize(26);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text("時代少年团 TNT — 解鎖拼圖挑戰", 40, 30);

  textSize(14);
  textStyle(NORMAL);
  fill(100, 110, 120);
  text("點擊 ? 答題解鎖拼圖，拖曳至左側拼圖板合成完整拼圖！", 40, 70);

  // 1. 繪製左側具有凹凸貝茲曲線邊框的拼圖底板
  drawJigsawBoard();

  // 2. 繪製散落及定位的拼圖塊
  for (let p of pieces) {
    if (p !== activePiece) {
      drawPiece(p);
    }
  }
  if (activePiece) {
    drawPiece(activePiece);
  }

  // 3. 繪製答題與即時對錯彈窗
  if (activeModal !== null) {
    drawQuestionModal(pieces[activeModal]);
  }

  // 4. 結算頁面
  if (isFinished) {
    drawResultOverlay();
  }
}

// 核心演算法：使用兩段 bezierCurveTo 繪製帶有凸起/凹槽的拼圖路徑
function drawPieceShape(ctx, x, y, size, edges) {
  let tabSize = size * 0.2; // 凸起/凹槽大小
  ctx.beginPath();
  ctx.moveTo(x, y);

  // 1. 上邊 (Top)
  if (edges.top === 0) {
    ctx.lineTo(x + size, y);
  } else {
    let dir = edges.top; // 1: 向上凸, -1: 向下凹
    ctx.lineTo(x + size * 0.35, y);
    ctx.bezierCurveTo(x + size * 0.35, y - dir * tabSize, x + size * 0.65, y - dir * tabSize, x + size * 0.65, y);
    ctx.lineTo(x + size, y);
  }

  // 2. 右邊 (Right)
  if (edges.right === 0) {
    ctx.lineTo(x + size, y + size);
  } else {
    let dir = edges.right; // 1: 向右凸, -1: 向左凹
    ctx.lineTo(x + size, y + size * 0.35);
    ctx.bezierCurveTo(x + size + dir * tabSize, y + size * 0.35, x + size + dir * tabSize, y + size * 0.65, x + size, y + size * 0.65);
    ctx.lineTo(x + size, y + size);
  }

  // 3. 下邊 (Bottom)
  if (edges.bottom === 0) {
    ctx.lineTo(x, y + size);
  } else {
    let dir = edges.bottom; // 1: 向下凸, -1: 向上凹
    ctx.lineTo(x + size * 0.65, y + size);
    ctx.bezierCurveTo(x + size * 0.65, y + size + dir * tabSize, x + size * 0.35, y + size + dir * tabSize, x + size * 0.35, y + size);
    ctx.lineTo(x, y + size);
  }

  // 4. 左邊 (Left)
  if (edges.left === 0) {
    ctx.lineTo(x, y);
  } else {
    let dir = edges.left; // 1: 向左凸, -1: 向右凹
    ctx.lineTo(x, y + size * 0.65);
    ctx.bezierCurveTo(x - dir * tabSize, y + size * 0.65, x - dir * tabSize, y + size * 0.35, x, y + size * 0.35);
    ctx.lineTo(x, y);
  }

  ctx.closePath();
}

// 繪製左側拼圖底板（包含每一塊拼圖對應的凹凸線條）
function drawJigsawBoard() {
  let ctx = drawingContext;

  // 繪製外層底座底色
  fill(235, 240, 248);
  stroke(200, 210, 225);
  strokeWeight(2);
  rect(35, 115, 460, 460, 16);

  // 繪製 3x3 每一格帶有凹凸貝茲曲線的底框
  for (let p of pieces) {
    ctx.save();
    drawPieceShape(ctx, p.targetX, p.targetY, 150, p.edges);
    ctx.fillStyle = '#E2E8F0'; // 淺灰背景
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1'; // 邊框線
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

// 繪製單個拼圖塊
function drawPiece(p) {
  let ctx = drawingContext;
  let size = 150;

  push();
  if (!p.isUnlocked) {
    // 尚未解鎖：深色卡片與問號 ?
    ctx.save();
    drawPieceShape(ctx, p.x, p.y, size, p.edges);
    ctx.fillStyle = '#4A5568';
    ctx.fill();
    ctx.strokeStyle = '#CBD5E0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    fill(255);
    textSize(36);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("?", p.x + size / 2, p.y + size / 2);
  } else {
    // 已解鎖：顯示色彩主題與名稱
    ctx.save();
    drawPieceShape(ctx, p.x, p.y, size, p.edges);
    ctx.clip(); 

    let col = p.theme.color;
    fill(col[0], col[1], col[2]);
    rect(p.x, p.y, size, size);

    fill(255, 255, 255, 50);
    ellipse(p.x + size / 2, p.y + size / 2, size * 0.8, size * 0.8);
    ctx.restore();

    ctx.save();
    drawPieceShape(ctx, p.x, p.y, size, p.edges);
    ctx.strokeStyle = p.isPlaced ? '#38A169' : '#2B6CB0';
    ctx.lineWidth = p.isPlaced ? 3 : 2;
    ctx.stroke();
    ctx.restore();

    fill(255);
    textSize(15);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(p.theme.name, p.x + size / 2, p.y + size / 2);
  }
  pop();
}

// 繪製題目與「即時顯示對錯」的 Modal 彈窗
function drawQuestionModal(p) {
  let q = p.question;

  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  let modalW = 520, modalH = 410;
  let modalX = (width - modalW) / 2;
  let modalY = (height - modalH) / 2;

  fill(255);
  stroke(220);
  strokeWeight(1);
  rect(modalX, modalY, modalW, modalH, 16);

  fill(40, 50, 70);
  textSize(18);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text(`解鎖拼圖塊 #${p.id + 1}`, width / 2, modalY + 22);

  textSize(15);
  textStyle(NORMAL);
  text(q.q, width / 2, modalY + 60);

  let startY = modalY + 105;
  for (let i = 0; i < q.options.length; i++) {
    let btnX = modalX + 40;
    let btnY = startY + i * 50;
    let btnW = modalW - 80;
    let btnH = 40;

    // 即時對錯高亮
    if (modalAnswerState !== null) {
      if (i === q.ans) {
        fill(220, 245, 230); // 正確解答（淡綠）
        stroke(76, 175, 80);
        strokeWeight(2);
      } else if (i === modalAnswerState.userChoice) {
        fill(255, 225, 225); // 選錯的選項（淡紅）
        stroke(244, 67, 54);
        strokeWeight(2);
      } else {
        fill(250);
        stroke(220);
        strokeWeight(1);
      }
    } else {
      fill(248, 250, 252);
      stroke(203, 213, 225);
      strokeWeight(1);
    }

    rect(btnX, btnY, btnW, btnH, 8);

    fill(50, 60, 70);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(`${i + 1}. ${q.options[i]}`, btnX + 15, btnY + btnH / 2);
  }

  // 點選答案後的即時對錯反饋與「確定解鎖」按鈕
  if (modalAnswerState !== null) {
    let isCorr = modalAnswerState.isCorrect;

    fill(isCorr ? color(46, 125, 50) : color(198, 40, 40));
    textSize(16);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(isCorr ? "✓ 回答正確！獲得分數" : `✗ 回答錯誤！正確答案是：${q.options[q.ans]}`, width / 2, modalY + 315);

    // 確定解鎖按鈕
    let nextBtnW = 140, nextBtnH = 38;
    let nextBtnX = width / 2 - nextBtnW / 2;
    let nextBtnY = modalY + 350;

    fill(33, 150, 243);
    noStroke();
    rect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 20);

    fill(255);
    textSize(15);
    textStyle(BOLD);
    text("確定解鎖", width / 2, nextBtnY + nextBtnH / 2);
  }
}

function mousePressed() {
  if (isFinished) return;

  // 1. 彈窗狀態處理
  if (activeModal !== null) {
    let modalW = 520, modalH = 410;
    let modalX = (width - modalW) / 2;
    let modalY = (height - modalH) / 2;

    let p = pieces[activeModal];
    let q = p.question;

    // A. 尚未作答時點擊選項：立即顯示對錯
    if (modalAnswerState === null) {
      let startY = modalY + 105;
      for (let i = 0; i < q.options.length; i++) {
        let btnX = modalX + 40;
        let btnY = startY + i * 50;
        let btnW = modalW - 80;
        let btnH = 40;

        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
          let isCorr = (i === q.ans);
          modalAnswerState = { userChoice: i, isCorrect: isCorr };
          p.isUnlocked = true;
          p.isCorrect = isCorr;
          break;
        }
      }
    } else {
      // B. 已得知對錯，點擊「確定解鎖」按鈕關閉彈窗
      let nextBtnW = 140, nextBtnH = 38;
      let nextBtnX = width / 2 - nextBtnW / 2;
      let nextBtnY = modalY + 350;

      if (mouseX > nextBtnX && mouseX < nextBtnX + nextBtnW && mouseY > nextBtnY && mouseY < nextBtnY + nextBtnH) {
        activeModal = null;
        modalAnswerState = null;
      }
    }
    return;
  }

  // 2. 點擊拼圖塊 (點擊 ? 開啟題目 / 拖曳已解鎖拼圖)
  for (let i = pieces.length - 1; i >= 0; i--) {
    let p = pieces[i];
    if (mouseX > p.x && mouseX < p.x + 150 && mouseY > p.y && mouseY < p.y + 150) {
      if (!p.isUnlocked) {
        activeModal = p.id;
        modalAnswerState = null;
      } else if (!p.isPlaced) {
        activePiece = p;
        dragOffsetX = mouseX - p.x;
        dragOffsetY = mouseY - p.y;
      }
      break;
    }
  }
}

function mouseDragged() {
  if (activePiece) {
    activePiece.x = mouseX - dragOffsetX;
    activePiece.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (activePiece) {
    let p = activePiece;
    let distToTarget = dist(p.x, p.y, p.targetX, p.targetY);

    // 當拼圖接近目標位置 (< 50px) 時自動吸附
    if (distToTarget < 50) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.isPlaced = true;
    }

    activePiece = null;
    checkCompletion();
  }
}

function checkCompletion() {
  let allPlaced = pieces.every(p => p.isPlaced);
  if (allPlaced) {
    isFinished = true;
  }
}

// 結算 Overlay
function drawResultOverlay() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  let w = 520, h = 520;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  fill(255);
  rect(x, y, w, h, 16);

  fill(40, 50, 70);
  textSize(24);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("🎉 恭喜完成時代少年團拼圖！", width / 2, y + 25);

  let correctCount = pieces.filter(p => p.isCorrect).length;
  let totalScore = Math.round((correctCount / 9) * 100);

  textSize(18);
  fill(72, 187, 120);
  text(`答對 ${correctCount} / 9 題 （總得分：${totalScore} 分）`, width / 2, y + 65);

  let gridX = x + 85, gridY = y + 110, tileSize = 110;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let idx = r * 3 + c;
      let p = pieces[idx];
      let tx = gridX + c * (tileSize + 10);
      let ty = gridY + r * (tileSize + 10);

      fill(p.isCorrect ? '#C6F6D5' : '#FED7D7');
      stroke(p.isCorrect ? '#38A169' : '#E53E3E');
      strokeWeight(2);
      rect(tx, ty, tileSize, tileSize, 12);

      fill(p.isCorrect ? '#22543D' : '#742A2A');
      textSize(28);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      text(p.isCorrect ? "✓" : "✗", tx + tileSize / 2, ty + tileSize / 2 - 10);

      textSize(12);
      textStyle(NORMAL);
      text(`第 ${idx + 1} 題`, tx + tileSize / 2, ty + tileSize / 2 + 25);
    }
  }

  let btnW = 160, btnH = 45;
  let btnX = width / 2 - btnW / 2;
  let btnY = y + h - 65;

  fill(66, 153, 225);
  noStroke();
  rect(btnX, btnY, btnW, btnH, 22);

  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("再玩一次", width / 2, btnY + btnH / 2);

  if (mouseIsPressed && mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
    initGame();
  }
}