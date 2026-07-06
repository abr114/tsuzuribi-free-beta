export type FeatureVisibility =
  | "freeCore"
  | "freeBeta"
  | "plusPreview"
  | "reviewOnly"
  | "devOnly";

export type FeatureRegistryItem = {
  id: string;
  label: string;
  note: string;
  visibility: FeatureVisibility;
};

export const featureVisibilityLabels = {
  devOnly: "内部確認だけで使うもの",
  freeBeta: "無償βで試せるもの",
  freeCore: "無料の基本体験として残すもの",
  plusPreview: "将来のPlus候補として見せるだけのもの",
  reviewOnly: "レビュー確認だけで使うもの",
} satisfies Record<FeatureVisibility, string>;

export const featureRegistry = [
  {
    id: "home-evidence-box",
    label: "ここまで",
    note: "保存済みの短いラベルから、結果前の行動の跡を見返す中心画面。",
    visibility: "freeCore",
  },
  {
    id: "one-tap-manual-log",
    label: "今日のことをひとつ残す",
    note: "日記を書かずに、近い行動と任意の短い一言を証拠ラベルとして残す導線。",
    visibility: "freeCore",
  },
  {
    id: "one-tap-optional-label-note",
    label: "任意の一言から短いラベルを作る",
    note: "今日の小さな行動を、保存前に編集できる短い証拠ラベルとして残す無償βの拡張。",
    visibility: "freeBeta",
  },
  {
    id: "memo-paste",
    label: "メモ貼り付け",
    note: "Googleを使わない人が、手元のメモから保存前候補を作り、日付なし行の扱いも選べる導線。",
    visibility: "freeBeta",
  },
  {
    id: "google-calendar-import",
    label: "Googleカレンダー確認",
    note: "ユーザー操作時だけ予定を読み、保存前確認を経て短いラベルだけを残す導線。",
    visibility: "freeBeta",
  },
  {
    id: "calendar-file-import",
    label: "CSV / ICS確認",
    note: "手元のカレンダーファイルをブラウザ内で読み、保存前候補を確認する導線。",
    visibility: "freeBeta",
  },
  {
    id: "beta-contact-form-link",
    label: "βお問い合わせフォーム導線",
    note: "VITE_CONTACT_URL がある時だけ表示する。既存環境向けに VITE_FEEDBACK_URL もfallbackとして読み、画面上はお問い合わせフォームに統一する。",
    visibility: "freeBeta",
  },
  {
    id: "beta-scope-settings-card",
    label: "無償βの範囲カード",
    note: "Settingsで、保存前確認、保存するもの、保存しないもの、未実装範囲を確認できる表示。",
    visibility: "freeBeta",
  },
  {
    id: "storage-repository-boundary",
    label: "保存層の差し込み口",
    note: "localStorageAdapterを現行保存として使い、将来DB移行用のRepository境界だけを用意する。",
    visibility: "freeBeta",
  },
  {
    id: "public-db-schema-plan",
    label: "DB schema案",
    note: "無償β後に検討する保存先の公開設計メモ。DB本接続はしない。",
    visibility: "freeBeta",
  },
  {
    id: "google-startup-check-plan",
    label: "Google起動時確認の方式メモ",
    note: "起動時候補更新を将来検討するための設計メモ。無償βでは自動保存も裏側定期取得もしない。",
    visibility: "freeBeta",
  },
  {
    id: "letters",
    label: "未来の自分への一文",
    note: "あとで見返す短い言葉を、この端末内に残す導線。",
    visibility: "freeBeta",
  },
  {
    id: "hard-time",
    label: "つらい時",
    note: "慰めを生成するのではなく、保存済みの跡や自分の言葉へ戻る導線。",
    visibility: "freeCore",
  },
  {
    id: "weekly-summary",
    label: "週ごとのまとめ",
    note: "将来のPlus候補。無償βでは課金制御や自動配信を作らない。",
    visibility: "plusPreview",
  },
  {
    id: "plus-introduction",
    label: "Plus案内",
    note: "価格や課金を確定せず、将来候補の範囲だけを確認する表示。",
    visibility: "plusPreview",
  },
  {
    id: "sample-calendar-data",
    label: "分類確認サンプル",
    note: "CSV / ICS / Google予定風データのレビュー確認用。通常のproduct導線には出さない。",
    visibility: "reviewOnly",
  },
  {
    id: "review-screen-switcher",
    label: "画面レビュー用ナビ",
    note: "?review=1 の時だけ使う、全画面確認用のナビゲーション。",
    visibility: "reviewOnly",
  },
  {
    id: "local-visual-audit-artifacts",
    label: "ローカル確認artifact",
    note: "Playwrightスクショや検証ログ。GitHub公開対象にしない。",
    visibility: "devOnly",
  },
] satisfies FeatureRegistryItem[];

export function getFeaturesByVisibility(visibility: FeatureVisibility) {
  return featureRegistry.filter((feature) => feature.visibility === visibility);
}
