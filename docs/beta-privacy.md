# つづりび 無償βのプライバシー説明

つづりびは、AIが慰めるためのアプリではありません。
結果が出る前の努力や行動の跡を、あとから見つけ直すための自己証拠箱です。

## 読むもの

- ユーザーが自分で選んだ短い入力
- メモ貼り付け画面に貼った行
- CSV / ICSファイル内の予定タイトルと日付
- Googleカレンダー連携を行った場合の予定タイトルと日時

Googleカレンダーは、ユーザーがボタンを押して連携し、読むカレンダーと期間を選んだ時だけ確認します。

## 読まないもの

- 端末内の他のファイル
- ブラウザ外のメモアプリ
- LINE、共有シート、iPhone/Androidメモの直接連携データ
- Googleカレンダーの予定本文、場所、参加者を保存目的で読む処理
- Googleを使わない人のカレンダー情報

## 保存するもの

現在の無償βでは、この端末のブラウザ内に次のものを保存します。

- 保存前に確認した短い証拠ラベル
- カテゴリ
- 日付ラベル
- 追加元
- ユーザー自身が書いた手紙・一文

保存先はlocalStorageです。既存キーは `tsuzuribi:prototype:v1` です。

## 保存しないもの

次の情報は保存しません。

- Google予定タイトルの生データ
- Google Calendar eventId
- Google Calendar calendarId
- location
- attendees
- description
- Google APIレスポンス全体
- Google access token
- Google refresh token
- 貼り付け原文全体
- 長文メモ本文
- 会話ログ全体

## まだ実装していないもの

- DB本接続
- refresh token保存
- Google起動時自動確認
- Google裏側定期取得
- Stripe
- AI
- 通知
- GitHub / Notion連携

## データ削除

Settingsの `この端末の記録を消す` から、このブラウザ内に保存した記録と手紙を削除できます。
別の端末や別のブラウザには同期していません。
