# つづりび 無償β準備版

つづりびは、AIが慰めるためのアプリではありません。
結果が出る前の努力や行動の跡を、あとから見つけ直すための「自己証拠箱」です。

無償βでは、有料版完成ではなく、GitHub / Vercel で安全に試せる状態を目指します。
記録はテスター本人のブラウザ内に保存され、こちらへ自動送信されません。

## 現在できること

- `ここまで`: 保存済みの短いラベルから、残っていた行動の跡を見返す
- `今日のことをひとつ残す`: 近い行動を1つ選び、任意の一言を短い証拠ラベルとして確認して保存する
- `メモから見つける`: Googleを使わず、手元のメモを貼り付けて候補を確認する
- `Googleカレンダーから見つける`: 読むカレンダーと期間を選び、保存前に候補を確認する
- `CSV / ICS確認`: 手元のカレンダーファイルをブラウザ内で読み、保存前候補を確認する
- `未来の自分への一文`: あとで見返す短い言葉を残す
- `つらい時`: 保存済みの跡や自分の一文へ戻る

## 保存するもの / 保存しないもの

保存するもの:

- 確認した短いラベル
- カテゴリ
- 日付ラベル
- 手紙として自分で入力した本文

保存しないもの:

- Google予定タイトルの生データ
- 場所
- 参加者
- 詳細本文
- Google CalendarのeventId
- Google CalendarのcalendarId
- Google APIレスポンス全体
- Google access token / refresh token

Google連携は、予定を勝手に保存しません。
予定を読み込んだあと、保存前確認画面で短いラベルとカテゴリを確認し、選んだ候補だけ保存します。

Googleを使わない人は、`メモから見つける` または `今日のことをひとつ残す` から試せます。
日付がないメモ行は、保存前に `今日として残す` / `日付なしで残す` / `保存しない` を選べます。
お問い合わせフォームURLを設定した環境では、Settingsから外部フォームを開けます。

テスター向け案内:

- [無償βテスター向け案内](docs/beta-test-guide.md)
- [無償βのプライバシー説明](docs/beta-privacy.md)
- [無償β共有用文面](docs/share-message.md)
- [無償β受け入れチェックリスト](docs/beta-acceptance-checklist.md)

## 未実装

今回の無償β準備版には、次の機能を入れていません。

- Stripe
- AI
- 通知
- Google裏側定期取得
- Google起動時自動確認
- Google refresh token保存
- Plus機能の課金制御
- GitHub / Notion連携
- DB本実装

## セットアップ

```bash
npm install
npm run dev
```

標準ローカルURL:

```text
http://localhost:5173/
```

つづりびでは、ローカル確認URLを `localhost:5173` に固定します。
5173 が使用中の場合、Viteは別ポートへ自動退避せず停止します。

公開本番URL:

```text
https://tsuzuribi-alpha.vercel.app/
```

## Google連携の環境変数

Google連携を確認する場合は、`.env.example` を `.env.local` にコピーし、Google Cloud Consoleで作成した OAuth 2.0 Client ID を設定します。

```powershell
Copy-Item .env.example .env.local
```

```text
VITE_GOOGLE_CLIENT_ID=<Google OAuth Client ID>
```

`.env.local` はGitHubへコミットしません。
`VITE_*` はクライアント側に露出する値なので、client secret、access token、refresh token、秘密情報は入れません。

Google Cloud Console の Authorized JavaScript origins には、次を登録します。

- `http://localhost:5173`
- Vercel本番URLのorigin: `https://tsuzuribi-alpha.vercel.app`

origin には末尾スラッシュ、パス、ワイルドカードを入れません。

## お問い合わせフォームURL

テスター向けにお問い合わせフォームを出す場合は、`.env.local` またはVercel環境変数に次を設定します。
未設定または空文字の場合、リンクは画面に表示しません。

```text
VITE_CONTACT_URL=<お問い合わせフォームなどのURL>
```

既存のVercel環境で `VITE_FEEDBACK_URL` だけが設定されている場合は、後方互換のfallbackとして同じお問い合わせフォーム導線に使います。新しく設定する場合は `VITE_CONTACT_URL` を使います。

フォームリンクはSettingsに「お問い合わせフォーム」として表示します。
実名、企業名、予定名などを書かなくてよい注意文を画面内に出しています。

## product / review モード

通常のWeb版URLと `http://localhost:5173/` は product モードで始まります。
無償βテスターに共有するのは product モードのURLです。

review モードは、開発者が全画面や確認用サンプルを点検するための表示です。
URLに `?review=1` を付けた時だけ開きます。

```text
http://localhost:5173/?review=1
```

product モードには、レビュー用サンプル読込ボタンや全画面確認ナビを出しません。

## 公開範囲の分類

公開範囲は [src/features/featureRegistry.ts](src/features/featureRegistry.ts) に軽く定義しています。
今回は分類を明文化するだけで、課金制御やロック表示は作っていません。

- `freeCore`: 無料の基本体験として残すもの
- `freeBeta`: 無償βで試せるもの
- `plusPreview`: 将来のPlus候補として見せるだけのもの
- `reviewOnly`: `?review=1` の時だけ使う確認用のもの
- `devOnly`: ローカル検証やartifactなど公開対象外のもの

## 保存層とDB方針

現在の保存先は、この端末のブラウザ内localStorageです。
保存キー `tsuzuribi:prototype:v1` は互換維持のため変更しません。

将来DBへ移行しやすいよう、保存層には `StorageRepository` と `localStorageAdapter` の差し込み口だけを置いています。
DB本接続はしていません。
DB schema案は [docs/db/schema.md](docs/db/schema.md) に整理しています。

## Google起動時確認

Google起動時自動確認は未実装です。
無償βでは、ユーザー操作によるGoogle確認だけを扱います。
将来方式は [docs/google-startup-check.md](docs/google-startup-check.md) に整理しています。
起動時に候補更新する場合も、自動保存はしない方針です。

## ビルドとテスト

```bash
npm run test
npm run build
```

Vercelでは次の設定を使います。

| 項目 | 設定 |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_GOOGLE_CLIENT_ID` |
| Optional Environment Variable | `VITE_CONTACT_URL` |
| Legacy Fallback Environment Variable | `VITE_FEEDBACK_URL` |

Vercelへ反映したあと、公開URLで product モード、Google連携の環境変数、390px表示を確認します。
READMEや提出資料に載せる本番URLは `https://tsuzuribi-alpha.vercel.app/` に統一します。
別途作られた `tsuzuribi` プロジェクトや `tsuzuribi.vercel.app` は無償β公開URLとして扱いません。

## GitHub公開前チェック

- `.env.local` が追跡されていない
- `artifacts/`, `test-results/`, `playwright-report/`, `coverage/` が混ざっていない
- PDF、スクショ、録画、個人資料をコミット対象にしていない
- `npm run test` が成功する
- `npm run build` が成功する
- product モードに内部確認用の文言やサンプル読込ボタンが出ない
- Google連携は保存前確認を通ってから保存される
