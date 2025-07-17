/**
 * 【定数設定】
 */
// 画面表示モード
const display = {
  TOP: 1,
  SELECT: 2,
  PUZZLE: 3,
  RESULT: 4,
};
// ゲームモード
const gameMode = {
  LYRIC_TO_SONG: { VALUE: '1', TEXT: '歌詞から曲名' },
  SONG_TO_LYRIC: { VALUE: '2', TEXT: '曲名から歌詞' },
};
// 設定ファイル情報
var appsettings = [];
// 歌詞ファイル情報
var artifacts = [];
// カラーセット
var colorSets = [];

/**
 * 【イベント処理】
 */
// 1. 画面表示
$(document).ready(async function () {
  try {
    // スピナー表示
    $('#spinner').show();

    // 1. 設定ファイル読み込み
    appsettings = await getJsonData('appsettings.json');

    // 2. アーティファクト情報読み込み
    artifacts = await fetchCsvData(
      appsettings.artifactsFileName,
      appsettings.artifactSkipRowCount
    );

    // 4. カラーセット読み込み
    colorSets = await fetchCsvData(appsettings.colorSetsFileName, 1);

    console.log('アーティファクト情報:', artifacts);
    // 5. 開始画面を表示
    createDisplay(display.TOP);
  } catch (error) {
    // エラーハンドリング
    showError('Failed to load data:', error);
  }
});

// 画面タグ作成
function createDisplay(mode, alubumName = '', artifactIndex = 0) {
  // 少し待ってから処理を開始（スピナー表示のため、DOM描画を反映させるため）
  setTimeout(() => {
    try {
      // タグクリア
      $('#display').empty();

      // 変数初期化
      var tag = '';

      // タグ作成
      if (mode === display.TOP) {
        //////////////////////////////////////////
        // TOP画面
        //////////////////////////////////////////
        // アルバム表示
        let albums = [
          ...new Set(artifacts.map((row) => row[appsettings.albumNameCol])),
        ];
        tag += ' <h2 class="h2-display">Album Select</h2>';
        tag += '<div class="album-list">';
        albums.forEach(function (album, index) {
          tag +=
            '<div class="album-item" onclick="createDisplay(display.SELECT,\'' +
            album +
            '\')">';
          tag +=
            ' <img src="' +
            appsettings.albumImagePath +
            +(index + 1) +
            '_' +
            album +
            '.jpg" id="' +
            album +
            '" name="album" alt="' +
            album +
            '" class="album">';
          tag += '<div class="album-title">' + album + '</div>';
          tag += ' </div>';
        });
        // // TODO アルバム追加できれば削除↓
        tag += '<div class="album-item">';
        tag +=
          '  <img src="images/album/はてな.jpg" alt="はてな" class="album">';
        tag += '  <div class="album-title">Coming Soon...</div>';
        tag += '</div>';
        tag += '<div class="album-item">';
        tag +=
          '  <img src="images/album/はてな.jpg" alt="はてな" class="album">';
        tag += '  <div class="album-title">Coming Soon...</div>';
        tag += '</div>';
        // // TODO アルバム追加できれば削除↑
        tag += ' </div>'; // album-list

        // カラーチェンジ
        tag +=
          ' <h2 id="changeColor" class="center-text margin-top-20" onclick="changeColor(1)">Color ↺</h2>';
        tag += ' </div>';

        // サイト情報
        tag += ' <footer style="text-align: center; margin-top: 2rem;">';
        tag +=
          '   <a href="about.html" target="_blank" rel="noopener noreferrer">サイト情報</a>';
        tag += ' </footer>';
        // 紙吹雪解除
        $('canvas')?.remove();

        // 一番上にスクロール
        scrollToTop();
      } else if (mode === display.SELECT) {
        //////////////////////////////////////////
        // SELECT画面
        //   引数：alubumName
        //////////////////////////////////////////

        // アーティファクト情報取得
        let dispArtifacts = artifacts.filter(
          (row) => row[appsettings.albumNameCol] === alubumName
        );

        // タグ生成
        tag += ' <h2 class="h2-display">Artifacts Select</h2>';
        tag += '<div class="album-list">';
        dispArtifacts.forEach(function (dispArtifact, index) {
          tag +=
            '<div class="album-item" onclick="createDisplay(display.PUZZLE,\'' +
            alubumName +
            "'," +
            index +
            ')">';
          tag +=
            ' <img src="' +
            appsettings.albumImagePath +
            +(index + 1) +
            '_' +
            alubumName +
            '.jpg" id="' +
            alubumName +
            '" name="album" alt="' +
            alubumName +
            '" class="album">';
          tag +=
            '<div class="album-title">' +
            dispArtifact[appsettings.artifactsNameCol] +
            '</div>';
          tag += ' </div>';
        });
        tag += ' </div>'; // album-list

        tag += ' <!-- 戻る ボタン -->';
        tag +=
          '   <button id="back" onclick="createDisplay(display.TOP)" class="btn btn--main btn--radius btn--cubic">←BACK</button>';
      } else if (mode === display.PUZZLE) {
        //////////////////////////////////////////
        // PUZZLE画面
        //////////////////////////////////////////
        tag += ' <h2 class="h2-display">Puzzle</h2>';
      } else if (mode === display.RESULT) {
        //////////////////////////////////////////
        // RESULT画面
        //////////////////////////////////////////
        tag += ' <h2 class="h2-display">Result</h2>';
      }

      // タグ流し込み
      $('#display').append(tag);

      // CSS適用
      changeColor(0);
    } finally {
      // 最後にスピナーを非表示
      $('#spinner').hide();
    }
  }, 0); // 0ms で「次のイベントループ」で処理実行（レンダリング保証）
}
