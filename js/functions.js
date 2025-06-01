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
  // 今のカラーインデックスを取得し、次のインデックス設定（ない場合最新のもの）
  var colorIndex =
    Number(getLocal('colorIndex') ?? colorSets.length - 1) + plusCount;

  // 設定するカラーを設定（ない場合最初に戻る）
  var colorSet = colorSets[colorIndex] ?? colorSets[0];
  $('body').css({
    background: colorSet[1],
    color: colorSet[2],
  });
  $('.btn--main').css({
    'background-color': colorSet[3],
    color: colorSet[4],
  });

  // ★ ラジオボタン選択スタイルの更新
  // すべてのラベルのスタイルを一度リセット（←これ大事）
  $('.quizModeRadio').removeAttr('style');
  // チェックされたラジオのID取得
  const checkedId = $('input[name="quizMode"]:checked').attr('id');
  // チェックされたラジオに対応するラベルだけにスタイル適用
  $('label[for="' + checkedId + '"]').css({
    'background-color': colorSet[3],
    color: colorSet[4],
  });

  // ★ ラジオボタン選択スタイルの仕込み(選択中のカラーになるよう関数再設定)
  $('input[name="quizMode"]').on('change', function () {
    // ラベルをリセット
    $('.quizModeRadio').removeAttr('style');
    // チェックされたラジオのID取得
    const checkedId = $('input[name="quizMode"]:checked').attr('id');
    // 対応するラベルにスタイル付与
    $('label[for="' + checkedId + '"]').css({
      'background-color': colorSet[3],
      color: colorSet[4],
    });

    // ローカルストレージにセット
    setLocal('gameMode', $('input[name="quizMode"]:checked').val());
  });

  // 今のカラー設定をローカルストレージに保存
  var colorIndexNow = colorSets[colorIndex] ? colorIndex : 0;
  setLocal('colorIndex', colorIndexNow);
  // 今のカラー表示
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
