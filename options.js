// デフォルト設定（初回起動時用）
const DEFAULT_CONFIG = [
  { label: "👤 Aさん", text: "Aです。" },
  { label: "👤 Bさん", text: "Bです。" }
];

// 保存処理
const saveOptions = () => {
  const jsonStr = document.getElementById('configJson').value;
  try {
    const members = JSON.parse(jsonStr);
    
    // chrome.storageに保存
    chrome.storage.sync.set({ familyMembers: members }, () => {
      const status = document.getElementById('status');
      status.style.opacity = '1';
      setTimeout(() => {
        status.style.opacity = '0';
      }, 2000);
    });
  } catch (e) {
    alert('⚠️ JSONの形式が正しくありません。\n\n' + e.message);
  }
};

// 読み込み処理
const restoreOptions = () => {
  // chrome.storageから読み込み（なければデフォルト値を使用）
  chrome.storage.sync.get({ familyMembers: DEFAULT_CONFIG }, (items) => {
    document.getElementById('configJson').value = JSON.stringify(items.familyMembers, null, 2);
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);