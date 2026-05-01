/**
 * 47Connect LP A/B Split Router
 *
 * 用途: index.html (A版) と index-b.html (B版) の50/50ランダム振り分け
 * 設置: index.html の <head> 内、Google tag (gtag) の直後に <script src="ab-split.js"></script>
 *
 * 動作:
 * 1. URLクエリで ?v=a / ?v=b が指定されていれば、そのまま該当版を表示（強制振り分け）
 * 2. 過去に振り分けされた訪問者は localStorage で固定（同一ユーザーは同じ版を見続ける）
 * 3. 初回訪問は50/50ランダム（B版当選なら index-b.html へリダイレクト）
 * 4. UTMパラメータ・referrer・元のクエリは保持
 *
 * オプトアウト:
 *  - bot/preview/SEOクローラー（User-Agent判定）はA版固定
 *  - ?v=a 強制クエリでA版固定
 */

(function() {
  'use strict';

  // ファイル名から現在の版を判定
  var path = window.location.pathname;
  var isOnBVariant = /index-b\.html$/i.test(path);
  var isOnAVariant = /index\.html$/i.test(path) || path === '/' || path.endsWith('/47connect-lp/');

  // クエリパラメータ取得
  var params = new URLSearchParams(window.location.search);
  var forcedVariant = params.get('v');

  // ボット判定（簡易）— SEO/プレビューはA版固定
  var ua = (navigator.userAgent || '').toLowerCase();
  var isBot = /bot|crawler|spider|preview|googleimageproxy|facebookexternalhit|slackbot|twitterbot|linkedinbot|whatsapp/i.test(ua);

  // 振り分け済みの記録キー
  var STORAGE_KEY = 'fromto_ab_variant';
  var storedVariant = null;
  try {
    storedVariant = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage が使えない環境は無視
  }

  // 強制クエリが優先
  var targetVariant;
  if (forcedVariant === 'a' || forcedVariant === 'b') {
    targetVariant = forcedVariant;
    try { localStorage.setItem(STORAGE_KEY, targetVariant); } catch (e) {}
  } else if (isBot) {
    // ボットはA版固定（SEO安定）
    targetVariant = 'a';
  } else if (storedVariant === 'a' || storedVariant === 'b') {
    // 既存ユーザーは振り分け固定
    targetVariant = storedVariant;
  } else {
    // 初回訪問: 50/50ランダム
    targetVariant = Math.random() < 0.5 ? 'a' : 'b';
    try { localStorage.setItem(STORAGE_KEY, targetVariant); } catch (e) {}
  }

  // GA4 にカスタムディメンションを送信
  if (typeof gtag === 'function') {
    gtag('event', 'ab_assignment', {
      'ab_variant': targetVariant,
      'ab_forced': (forcedVariant === 'a' || forcedVariant === 'b'),
      'ab_returning': !!storedVariant
    });
  }

  // リダイレクト判定（同一版なら何もしない・無限ループ防止）
  if (targetVariant === 'b' && isOnAVariant && !isOnBVariant) {
    var newQuery = window.location.search;
    if (!params.has('v')) {
      newQuery = newQuery ? newQuery + '&v=b' : '?v=b';
    }
    window.location.replace('index-b.html' + newQuery + window.location.hash);
  } else if (targetVariant === 'a' && isOnBVariant) {
    var newQueryA = window.location.search.replace(/[?&]v=b\b/, '');
    if (newQueryA === '?') newQueryA = '';
    window.location.replace('index.html' + newQueryA + window.location.hash);
  }
})();
