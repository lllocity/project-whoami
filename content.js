// ページ読み込み完了時と、URL変更時（SPA対策）に初期化を試みる
let currentUrl = location.href;
const observer = new MutationObserver(() => {
  if (currentUrl !== location.href) {
    currentUrl = location.href;
    init();
  }
  // DOMの変化も監視して入力欄が出現したらボタンを追加
  init();
});

observer.observe(document.body, { childList: true, subtree: true });

function init() {
  // 入力欄を探す（Gemini, ChatGPTなどに対応するため contenteditable を探すのが汎用的）
  const inputArea = document.querySelector('div[contenteditable="true"], textarea');
  
  // 入力欄が見つからない、または既にボタン設置済みの場合は終了
  if (!inputArea || inputArea.parentElement.querySelector('.whoami-buttons-container')) return;

  // 設定を読み込んでボタンを生成
  chrome.storage.sync.get({ 
    familyMembers: [ 
      { label: "Example", text: "Please configure in options." } 
    ] 
  }, (items) => {
    createButtons(inputArea, items.familyMembers);
  });
}

function createButtons(inputArea, members) {
  // 二重追加防止チェック（念のため）
  if (inputArea.parentElement.querySelector('.whoami-buttons-container')) return;

  const container = document.createElement('div');
  container.className = 'whoami-buttons-container';
  container.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; padding: 0 10px; flex-wrap: wrap;';

  members.forEach(member => {
    const btn = document.createElement('button');
    btn.textContent = member.label;
    btn.style.cssText = `
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid #dcdcdc;
      background: #ffffff;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      transition: all 0.2s;
      font-weight: 500;
    `;
    
    // マウスホバー時のエフェクト
    btn.onmouseover = () => btn.style.background = '#f0f0f0';
    btn.onmouseout = () => btn.style.background = '#ffffff';

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation(); // 親要素へのイベント伝播を止める
      insertText(inputArea, member.text);
    };
    
    container.appendChild(btn);
  });

  // 入力欄の直前にボタンコンテナを挿入
  inputArea.parentElement.insertBefore(container, inputArea);
}

function insertText(inputElement, text) {
  inputElement.focus();
  
  // document.execCommand は非推奨ですが、既存の多くのWebエディタで
  // 最も確実にReact等のステート管理と連携できる方法です。
  const success = document.execCommand('insertText', false, text + "\n");
  
  // execCommandが効かない場合（一部の新しいサイトなど）のフォールバック
  if (!success) {
    inputElement.value = (inputElement.value || '') + text + "\n";
    // React等に変更を通知するためのイベント発火
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
}