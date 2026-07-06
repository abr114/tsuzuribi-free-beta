# つづりび DB schema案

無償βではDB本接続をしません。現在の保存先は、既存キー `tsuzuribi:prototype:v1` のlocalStorageです。
この文書は、将来DBへ移す時の最小設計メモです。

## 方針

- 保存する中心は、ユーザーが保存前に確認した短い証拠ラベルです。
- Google予定タイトルの生データ、eventId、calendarId、location、attendees、description、APIレスポンス全体は保存しません。
- evidence_counts は保存済みラベルから再計算できる派生値として扱い、初期DBでは必須にしません。
- oauth_tokens、subscriptions、notification_settings は今回作りません。
- Google refresh token保存、通知、課金、裏側定期取得は別フェーズです。

## users

将来のログイン後に、アプリ利用者を識別するためのテーブルです。

```sql
create table users (
  id uuid primary key,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## evidence_labels

保存前確認を通った短い証拠ラベルだけを保存します。

```sql
create table evidence_labels (
  id uuid primary key,
  user_id uuid not null references users(id),
  label text not null,
  category text not null check (category in ('future', 'build', 'care', 'return')),
  category_label text not null,
  source text not null check (source in ('manual', 'reflection', 'memoPaste', 'calendarFile', 'googleCalendar', 'letter', 'app')),
  date_label text not null,
  occurred_on date,
  created_at timestamptz not null default now()
);
```

`date_label` は `今日`、`6/12`、`日付なし` など、現在の画面表示と互換にするために残します。
`occurred_on` は分かる時だけ入れ、日付なし行では `null` にします。

## letters

ユーザー自身が残した一文を保存します。AI生成本文ではありません。

```sql
create table letters (
  id uuid primary key,
  user_id uuid not null references users(id),
  body text not null,
  source text not null default 'letter',
  visibility text not null default 'private',
  created_at timestamptz not null default now()
);
```

## user_consents

Google連携や将来の保存先変更など、明示同意が必要な項目を記録します。

```sql
create table user_consents (
  id uuid primary key,
  user_id uuid not null references users(id),
  consent_type text not null,
  consent_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
```

## manual_logs

保存前確認に入る前の、手動入力やメモ貼り付け由来の処理状態を残す場合の最小テーブルです。
貼り付け原文全体は保存しません。

```sql
create table manual_logs (
  id uuid primary key,
  user_id uuid not null references users(id),
  evidence_label_id uuid references evidence_labels(id),
  input_type text not null check (input_type in ('oneTap', 'memoPaste', 'reflection')),
  selected_date_handling text check (selected_date_handling in ('known', 'today', 'none')),
  created_at timestamptz not null default now()
);
```

`manual_logs` は補助情報だけを持ちます。長文メモ本文、会話ログ、Google raw情報はここにも保存しません。
