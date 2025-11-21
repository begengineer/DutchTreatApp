// 参加者を管理する配列
let participants = [];

// DOM要素の取得
const personNameInput = document.getElementById('personName');
const personRatioInput = document.getElementById('personRatio');
const addPersonBtn = document.getElementById('addPersonBtn');
const participantsList = document.getElementById('participantsList');
const totalAmountInput = document.getElementById('totalAmount');
const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('resultSection');
const resultList = document.getElementById('resultList');
const calculatedTotal = document.getElementById('calculatedTotal');

// 参加者を追加する関数
function addParticipant() {
    const name = personNameInput.value.trim();
    const ratio = parseFloat(personRatioInput.value);

    // バリデーション
    if (!name) {
        alert('名前を入力してください');
        return;
    }

    if (isNaN(ratio) || ratio <= 0) {
        alert('有効な倍率を入力してください（0より大きい数値）');
        return;
    }

    // 参加者を追加
    const participant = {
        id: Date.now(),
        name: name,
        ratio: ratio
    };

    participants.push(participant);

    // 入力フィールドをクリア
    personNameInput.value = '';
    personRatioInput.value = '1.0';

    // 参加者リストを更新
    renderParticipants();

    // フォーカスを名前入力欄に戻す
    personNameInput.focus();
}

// 参加者を削除する関数
function removeParticipant(id) {
    participants = participants.filter(p => p.id !== id);
    renderParticipants();
}

// 参加者リストを描画する関数
function renderParticipants() {
    if (participants.length === 0) {
        participantsList.innerHTML = '<p class="empty-message">参加者を追加してください</p>';
        calculateBtn.disabled = true;
        return;
    }

    calculateBtn.disabled = false;

    participantsList.innerHTML = participants.map(participant => `
        <div class="participant-item">
            <div class="participant-info">
                <span class="participant-name">${escapeHtml(participant.name)}</span>
                <span class="participant-ratio">×${participant.ratio.toFixed(1)}</span>
            </div>
            <button class="btn-remove" onclick="removeParticipant(${participant.id})">削除</button>
        </div>
    `).join('');
}

// 割り勘を計算する関数
function calculateSplit() {
    const totalAmount = parseFloat(totalAmountInput.value);

    // バリデーション
    if (isNaN(totalAmount) || totalAmount <= 0) {
        alert('有効な合計金額を入力してください');
        return;
    }

    if (participants.length === 0) {
        alert('参加者を追加してください');
        return;
    }

    // 倍率の合計を計算
    const totalRatio = participants.reduce((sum, p) => sum + p.ratio, 0);

    // 基本単位額を計算（1倍率あたりの金額）
    const baseAmount = totalAmount / totalRatio;

    // 各参加者の支払い額を計算
    const results = participants.map(participant => ({
        name: participant.name,
        ratio: participant.ratio,
        amount: Math.round(baseAmount * participant.ratio)
    }));

    // 端数調整（合計が元の金額と一致するように）
    const calculatedSum = results.reduce((sum, r) => sum + r.amount, 0);
    const difference = totalAmount - calculatedSum;

    if (difference !== 0) {
        // 最も高い倍率の人に端数を調整
        const maxRatioIndex = results.reduce((maxIndex, result, index, arr) =>
            result.ratio > arr[maxIndex].ratio ? index : maxIndex, 0
        );
        results[maxRatioIndex].amount += difference;
    }

    // 結果を表示
    renderResults(results, totalAmount);
}

// 結果を描画する関数
function renderResults(results, total) {
    resultList.innerHTML = results.map(result => `
        <div class="result-item">
            <div>
                <span class="result-name">${escapeHtml(result.name)}</span>
                <span style="color: #888; font-size: 0.9rem;"> (×${result.ratio.toFixed(1)})</span>
            </div>
            <span class="result-amount">${result.amount.toLocaleString()}円</span>
        </div>
    `).join('');

    calculatedTotal.textContent = `${total.toLocaleString()}円`;
    resultSection.style.display = 'block';

    // 結果セクションまでスムーズにスクロール
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// HTMLエスケープ関数（XSS対策）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// イベントリスナーの設定
addPersonBtn.addEventListener('click', addParticipant);

// Enterキーで参加者を追加
personNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipant();
    }
});

personRatioInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipant();
    }
});

// 計算ボタン
calculateBtn.addEventListener('click', calculateSplit);

// 合計金額でEnterキーを押したら計算
totalAmountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !calculateBtn.disabled) {
        calculateSplit();
    }
});

// 初期状態で計算ボタンを無効化
calculateBtn.disabled = true;

// 訪問者カウンター機能
function initVisitorCounter() {
    const VISITOR_COUNT_KEY = 'dutreat_visitor_count';

    // localStorageから訪問者数を取得
    let visitorCount = parseInt(localStorage.getItem(VISITOR_COUNT_KEY) || '0', 10);

    // 訪問者数を1増やす
    visitorCount++;

    // localStorageに保存
    localStorage.setItem(VISITOR_COUNT_KEY, visitorCount.toString());

    // 画面に表示
    const visitorCountElement = document.getElementById('visitorCount');
    if (visitorCountElement) {
        visitorCountElement.textContent = visitorCount.toLocaleString();
    }
}

// ページ読み込み時に訪問者カウンターを初期化
document.addEventListener('DOMContentLoaded', initVisitorCounter);
