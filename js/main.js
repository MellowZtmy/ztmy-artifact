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
function createDisplay(mode, alubumName = '', puzzleIndex = -1) {
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
        //////////////////////////////////////////
        var quiz = quizzes[currentQuizIndex];
        // 『』で囲む対象の区別
        let isgameModeLyricToSong =
          getLocal('gameMode') === gameMode.LYRIC_TO_SONG.VALUE;
        tag += ' ';
        tag += ' <!-- 問題番号 -->';
        tag +=
          ' <h2 class="h2-display">Question. ' +
          (currentQuizIndex + 1) +
          ' / ' +
          quizzes.length +
          '</h2>';
        tag += ' ';
        tag += ' <!-- 問題文 -->';
        tag += ` <p class="font-one-point-five reveal">
        ${
          (isgameModeLyricToSong ? '『' : '') +
          quiz.question +
          (isgameModeLyricToSong ? '』' : '')
        }</p>`;
        tag += ' ';
        tag += ' <!-- 選択肢のラジオボタン + ラベル -->';
        quiz.choices.forEach((choice, index) => {
          tag += '   <label';
          tag += '     class="choice-radio-label"';
          tag += '   >';
          tag += '     <input';
          tag += '       type="radio"';
          tag += '       id="choice' + index + '"';
          tag += '       value="' + index + '"';
          tag += '       name="choices"';
          tag += '       onchange="onSelect(' + index + ')"';
          tag += '     >';
          tag += '     <span class="left-text">';
          tag +=
            '     ' +
            (isgameModeLyricToSong ? '' : '『') +
            choice +
            (isgameModeLyricToSong ? '' : '』');
          tag += '     </span>';
          tag +=
            '     <span id="marubatu' +
            index +
            '" class="right-text bold-text font-one-point-five">';
          tag += '     ';
          tag += '     </span>';
          tag += '   </label>';
          tag += ' ';
        });

        tag += ' ';
        tag += ' <!-- 次へ / 終了 ボタン -->';
        tag += quizzes[currentQuizIndex + 1]
          ? '   <button id="next" onclick="loadQuiz(false)" class="btn btn--main btn--radius btn--cubic visibility-hidden">NEXT→</button>'
          : '   <button id="result" onclick="showResult()" class="btn btn--main btn--radius btn--cubic visibility-hidden">RESULT</button>';
        // MV表示
        tag += '    <!--MV Youtube--> ';
        tag += '    <div class="margin-top-20" id="mv" hidden> ';
        tag +=
          '      <div style="position: relative; width: 100%; padding-bottom: 56.25%"> ';
        tag += '        <div ';
        tag += '          style=" ';
        tag += '            position: absolute; ';
        tag += '            top: 0px; ';
        tag += '            left: 0px; ';
        tag += '            width: 100%; ';
        tag += '            height: 100%; ';
        tag += '          " ';
        tag += '        > ';
        tag += '          <iframe ';
        tag +=
          '            src="https://www.youtube.com/embed/' +
          quiz.mvId +
          '?loop=1&playlist=' +
          quiz.mvId +
          '" ';
        tag += '            frameborder="0" ';
        tag += '            width="100%" ';
        tag += '            height="100%"  style="border-radius: 15px;"';
        tag += '            allowfullscreen="" ';
        tag += '          ></iframe> ';
        tag += '        </div> ';
        tag += '      </div> ';
        tag += `    <p class="right-text-no-ellipsis"> ずっと真夜中でいいのに。<br>`;
        tag += `    『${quiz.song}』<br>`;
        tag += `    （作詞 ： ${quiz.lyricist}）</p>`;
        tag += '    </div> ';
      } else if (mode === display.RESULT) {
        // 問題数取得
        var quizzesLength = quizzes.length;
        // 正解数取得
        var correctCount = selectedList.filter(
          (value, index) => value === quizzes[index].correctAnswer
        ).length;
        // RESULT画面
        // 正解数表示
        tag +=
          ' <h2 class="center-text' +
          (correctCount === quizzesLength ? ' text-correct' : '') +
          '">' +
          correctCount +
          ' / ' +
          quizzesLength +
          '</h2>';
        tag +=
          correctCount === quizzesLength
            ? '<h2 class="center-text text-correct">PERFECT!!</h2>'
            : '';
        // Result表示
        tag += ' <h2 class="h2-display">Result</h2>';
        quizzes.forEach((quiz, index) => {
          tag +=
            ' <div class="font-one-point-two">Q' +
            (index + 1) +
            '. ' +
            quiz.question +
            '</div>';
          tag +=
            ' <div class="font-one-point-two right-text ' +
            (selectedList[index] === quiz.correctAnswer ? 'text-correct' : '') +
            '">' +
            quiz.choices[quiz.correctAnswer] +
            '</div>';
          tag += index === quizzes.length - 1 ? '' : '<br>';
        });
        // アルバム表示
        tag +=
          selectedAlbums.length > 0
            ? ' <h2 class="h2-display">Albums</h2>'
            : '';
        albums.forEach(function (album, index) {
          if (selectedAlbums.includes(album)) {
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
          }
        });

        tag +=
          ' <button id="retry" onclick="createDisplay(display.TOP)" class="btn btn--main btn--radius btn--cubic">RETRY</button>';

        // ハイスコア設定(「??」は「<」より優先度が低いのでカッコをつける
        if ((Number(getLocal('ztmyLyricQuizHighScore')) ?? 0) < correctCount) {
          setLocal('ztmyLyricQuizHighScore', correctCount);
        }
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
