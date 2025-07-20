// JSONデータを取得する関数
function getJsonData(jsonUrl) {
  return new Promise((resolve, reject) => {
    $.getJSON(jsonUrl, function (data) {
      resolve(data);
    }).fail(function () {
      reject('Failed to load JSON file');
    });
  });
}

// CSVデータを取得する関数
async function fetchCsvData(fileName, skipRowCount = 0) {
  try {
    const response = await fetch(fileName);
    const text = await response.text();
    return parseCsv(text, skipRowCount);
  } catch (error) {
    throw new Error('Failed to load CSV file:' + fileName);
  }
}

// CSVデータをパースする関数（csvデータ内の「,」は「，」にしているため「,」に変換して返却）
function parseCsv(csvText, skipRowCount) {
  var regx = new RegExp(appsettings.commaInString, 'g');
  return csvText
    .trim()
    .split(/\r?\n|\r/)
    .slice(skipRowCount)
    .map((line) => line.split(',').map((value) => value.replace(regx, ',')));
}

// データをローカルストレージからクリアする関数
function removeLocal(key) {
  localStorage.removeItem(appsettings.appName + '.' + key);
}

// データをローカルストレージにセットする関数
function setLocal(key, value) {
  localStorage.setItem(appsettings.appName + '.' + key, value);
}

// ローカルストレージからデータをゲットする関数
function getLocal(key) {
  return localStorage.getItem(appsettings.appName + '.' + key);
}

// ローカルストレージから配列を取得(nullは空に)
function getLocalArray(key) {
  return (
    JSON.parse(localStorage.getItem(appsettings.appName + '.' + key)) ?? []
  );
}

// ローカルストレージに配列設定(nullは空に)
function setLocalArray(key, array) {
  localStorage.setItem(
    appsettings.appName + '.' + key,
    JSON.stringify(array ?? [])
  );
}

// エラー時処理
function showError(errorMsg1, errorMsg2) {
  // コンソールに表示
  console.error(errorMsg1, errorMsg2);
  // 画面に表示
  alert(errorMsg2);
}

// カラーチェンジ
function changeColor(plusCount) {
  // 現在のカラーインデックスを取得
  var colorIndex =
    Number(getLocal('colorIndex') ?? colorSets.length - 1) + plusCount;

  // 対象のカラーデータを取得（存在しない場合は最初に戻る）
  var colorSet = colorSets[colorIndex] ?? colorSets[0];

  // HTML全体の背景とテキストカラーを変更（グラデーションを適用する）
  $('html, body').css({
    background: colorSet[1], // linear-gradient もここでOK
    color: colorSet[2],
  });

  // ボタンの色を設定
  $('.normalButton').css({
    'background-color': colorSet[3],
    color: colorSet[4],
  });

  // ローカルストレージに現在のカラーインデックスを保存
  var colorIndexNow = colorSets[colorIndex] ? colorIndex : 0;
  setLocal('colorIndex', colorIndexNow);

  // 現在のカラー表示
  $('#changeColor').html(
    'Color ↺ <br>(' + (colorIndexNow + 1) + '/' + colorSets.length + ')'
  );
}

function scrollToTop() {
  // 一番上にスクロール
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
