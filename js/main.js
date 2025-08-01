// 画面の識別用定数
const display = {
  TOP: 'top', // トップ画面
  SELECT: 'select', // パズル選択画面
  PUZZLE: 'puzzle', // パズルプレイ画面
  RESULT: 'result', // 結果画面
};

// 設定・データ保持用のグローバル変数
var appsettings = []; // アプリの設定ファイル（JSON）
var puzzles = []; // パズルの一覧（CSV）
var colorSets = []; // カラーセットの情報（CSV）

var currentAlbum = ''; // 現在選択中のアルバム名
var currentPuzzleIndex = 0; // 現在のパズルインデックス

// ページ読み込み時の初期化処理
$(document).ready(async function () {
  try {
    // ローディングスピナー表示
    $('#spinner').show();

    // 設定ファイルを読み込み
    appsettings = await getJsonData('appsettings.json');

    // パズルCSV読み込み（指定行スキップ）
    puzzles = await fetchCsvData(
      appsettings.puzzlesFileName,
      appsettings.puzzleSkipRowCount
    );

    // カラーセット読み込み（先頭1行スキップ）
    colorSets = await fetchCsvData(appsettings.colorSetsFileName, 1);

    // トップ画面へ遷移
    goToScreen(display.TOP);

    // カラーを適用
    changeColor(0);
  } catch (error) {
    // データ読み込み失敗時にエラー表示
    showError('Failed to load data:', error);
  }
});

/**
 * 画面遷移を行う共通関数
 * @param {string} screenName 遷移先の画面名
 * @param {string} albumName アルバム名（必要に応じて）
 * @param {number} puzzleIndex パズルのインデックス（必要に応じて）
 */
function goToScreen(screenName, albumName = '', puzzleIndex = 0) {
  // ローディングスピナー表示
  $('#spinner').show();

  // 全ての画面を非表示にする
  document.querySelectorAll('.screen').forEach((el) => (el.hidden = true));

  // 各画面ごとの表示・描画処理
  if (screenName === display.TOP) {
    document.getElementById('screen-top').hidden = false;
    renderTopScreen();
  } else if (screenName === display.SELECT) {
    currentAlbum = albumName;
    document.getElementById('screen-select').hidden = false;
    renderSelectScreen(albumName);
  } else if (screenName === display.PUZZLE) {
    currentPuzzleIndex = puzzleIndex;
    document.getElementById('screen-puzzle').hidden = false;
    renderPuzzleScreen(albumName, puzzleIndex);
  } else if (screenName === display.RESULT) {
    document.getElementById('screen-result').hidden = false;
    renderResultScreen();
  }

  // スピナー非表示にする
  $('#spinner').hide();
}

/**
 * トップ画面の描画処理（アルバム選択）
 */
function renderTopScreen() {
  const albumList = document.getElementById('album-list-top');
  albumList.innerHTML = '';

  // ユニークなアルバム名一覧を取得
  let albums = [
    ...new Set(puzzles.map((row) => row[appsettings.albumNameCol])),
  ];

  // 各アルバムを画面に追加
  albums.forEach((album, index) => {
    const div = document.createElement('div');
    div.className = 'album-item';
    div.onclick = () => goToScreen(display.SELECT, album); // アルバム選択で次画面へ

    const img = document.createElement('img');
    img.src = `${appsettings.albumImagePath}${index + 1}_${album}.jpg`;
    img.alt = album;
    img.className = 'album';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'album-title';
    titleDiv.textContent = album;

    div.appendChild(img);
    div.appendChild(titleDiv);
    albumList.appendChild(div);
  });

  // coming soon
  const div = document.createElement('div');
  div.className = 'album-item';

  const img = document.createElement('img');
  img.src = `${appsettings.albumImagePath}はてな.jpg`;
  img.alt = 'はてな';
  img.className = 'album';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'album-title';
  titleDiv.textContent = 'coming soon...';

  div.appendChild(img);
  div.appendChild(titleDiv);
  albumList.appendChild(div);
}

/**
 * パズル選択画面の描画処理（曲ごとにまとめる）
 * @param {string} albumName 選択されたアルバム名
 */
function renderSelectScreen(albumName) {
  const selectList = document.getElementById('puzzle-list-select');
  selectList.innerHTML = '';

  // 対象アルバムに属するパズルを抽出
  let dispPuzzles = puzzles.filter(
    (row) => row[appsettings.albumNameCol] === albumName
  );

  // 曲名でパズルをグループ化
  const groupedBySong = {};
  dispPuzzles.forEach((puzzle, index) => {
    const songName = puzzle[appsettings.songNameCol]; // 曲名列

    if (!groupedBySong[songName]) {
      groupedBySong[songName] = [];
    }

    // パズルとそのインデックスを保存
    groupedBySong[songName].push({ puzzle, index });
  });

  // 各曲ごとにヘッダーとパズルを描画
  for (const song in groupedBySong) {
    // 曲名見出し
    const songHeader = document.createElement('h3');
    songHeader.className = 'song-header';
    songHeader.textContent = song;
    selectList.appendChild(songHeader);

    // パズル画像リスト
    const songContainer = document.createElement('div');
    songContainer.className = 'song-puzzles';

    groupedBySong[song].forEach(({ puzzle, index }) => {
      const div = document.createElement('div');
      div.className = 'puzzle-item';
      div.onclick = () => goToScreen(display.PUZZLE, albumName, index);

      const img = document.createElement('img');
      img.src = `${appsettings.puzzleImagePath}はてな.jpg`;
      img.alt = puzzle[appsettings.puzzlesNameCol];
      img.className = 'puzzle';

      div.appendChild(img);
      songContainer.appendChild(div);
    });

    selectList.appendChild(songContainer);
  }

  // トップに戻るボタン
  document.getElementById('back-to-top').onclick = () =>
    goToScreen(display.TOP);
}

/**
 * パズル画面の描画（仮の表示のみ）
 * @param {string} albumName アルバム名
 * @param {number} puzzleIndex パズルのインデックス
 */
function renderPuzzleScreen(albumName, puzzleIndex) {
  const puzzleDiv = document.getElementById('puzzle-content');

  // 仮のパズル表示
  puzzleDiv.innerHTML = `<p>パズル画面（アルバム: ${albumName}、パズル番号: ${puzzleIndex}）</p>`;

  // 戻るボタン（パズル選択へ）
  document.getElementById('back-to-select').onclick = () =>
    goToScreen(display.SELECT, albumName);
}

/**
 * パズル終了後の結果画面
 */
function renderResultScreen() {
  const resultDiv = document.getElementById('result-content');
  resultDiv.innerHTML = `<p>結果画面</p>`;

  // パズル画面に戻るボタン
  document.getElementById('back-to-puzzle').onclick = () =>
    goToScreen(display.PUZZLE, currentAlbum, currentPuzzleIndex);

  // トップ画面に戻るボタン
  document.getElementById('back-to-top-from-result').onclick = () =>
    goToScreen(display.TOP);
}
