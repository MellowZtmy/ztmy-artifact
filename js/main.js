const display = {
  TOP: 'top',
  SELECT: 'select',
  PUZZLE: 'puzzle',
  RESULT: 'result',
};

var appsettings = [];
var artifacts = [];
var colorSets = [];

var currentAlbum = '';
var currentArtifactIndex = 0;

$(document).ready(async function () {
  try {
    $('#spinner').show();

    appsettings = await getJsonData('appsettings.json');

    artifacts = await fetchCsvData(
      appsettings.artifactsFileName,
      appsettings.artifactSkipRowCount
    );

    colorSets = await fetchCsvData(appsettings.colorSetsFileName, 1);

    // 初期画面表示
    goToScreen(display.TOP);

    // カラーチェンジ
    changeColor(0);
  } catch (error) {
    showError('Failed to load data:', error);
  }
});

function goToScreen(screenName, albumName = '', artifactIndex = 0) {
  // 全画面非表示
  document.querySelectorAll('.screen').forEach((el) => (el.hidden = true));

  if (screenName === display.TOP) {
    document.getElementById('screen-top').hidden = false;
    renderTopScreen();
  } else if (screenName === display.SELECT) {
    currentAlbum = albumName;
    document.getElementById('screen-select').hidden = false;
    renderSelectScreen(albumName);
  } else if (screenName === display.PUZZLE) {
    currentArtifactIndex = artifactIndex;
    document.getElementById('screen-puzzle').hidden = false;
    renderPuzzleScreen(albumName, artifactIndex);
  } else if (screenName === display.RESULT) {
    document.getElementById('screen-result').hidden = false;
    renderResultScreen();
  }

  $('#spinner').hide();
}

function renderTopScreen() {
  const albumList = document.getElementById('album-list-top');
  albumList.innerHTML = '';

  let albums = [
    ...new Set(artifacts.map((row) => row[appsettings.albumNameCol])),
  ];
  albums.forEach((album, index) => {
    const div = document.createElement('div');
    div.className = 'album-item';
    div.onclick = () => goToScreen(display.SELECT, album);

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
}

function renderSelectScreen(albumName) {
  const selectList = document.getElementById('album-list-select');
  selectList.innerHTML = '';

  let dispArtifacts = artifacts.filter(
    (row) => row[appsettings.albumNameCol] === albumName
  );
  dispArtifacts.forEach((artifact, index) => {
    const div = document.createElement('div');
    div.className = 'album-item';
    div.onclick = () => goToScreen(display.PUZZLE, albumName, index);

    const img = document.createElement('img');
    img.src = `${appsettings.albumImagePath}${index + 1}_${albumName}.jpg`;
    img.alt = albumName;
    img.className = 'album';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'album-title';
    titleDiv.textContent = artifact[appsettings.artifactsNameCol];

    div.appendChild(img);
    div.appendChild(titleDiv);
    selectList.appendChild(div);
  });

  // 戻るボタン
  document.getElementById('back-to-top').onclick = () =>
    goToScreen(display.TOP);
}

function renderPuzzleScreen(albumName, artifactIndex) {
  const puzzleDiv = document.getElementById('puzzle-content');
  puzzleDiv.innerHTML = `<p>パズル画面（アルバム: ${albumName}、アーティファクト番号: ${artifactIndex}）</p>`;

  // 戻るボタン
  document.getElementById('back-to-select').onclick = () =>
    goToScreen(display.SELECT, albumName);
}

function renderResultScreen() {
  const resultDiv = document.getElementById('result-content');
  resultDiv.innerHTML = `<p>結果画面</p>`;

  document.getElementById('back-to-puzzle').onclick = () =>
    goToScreen(display.PUZZLE, currentAlbum, currentArtifactIndex);
  document.getElementById('back-to-top-from-result').onclick = () =>
    goToScreen(display.TOP);
}
