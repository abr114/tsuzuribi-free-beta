import type {
  CtaItem,
  EvidenceCount,
  MockRecordDraft,
  MockRecordSource,
  RecordCategory,
  ScreenNavItem,
  TagItem,
} from "../types/content";

export const brandName = "つづりび";

export const reviewScreenNav = [
  { id: "home", label: "ホーム / ここまで", shortLabel: "ホーム" },
  { id: "lowCount", label: "ゆっくり見る", shortLabel: "ゆっくり" },
  { id: "reflection", label: "この7日間から拾う", shortLabel: "7日間" },
  { id: "googleExplain", label: "Google連携", shortLabel: "Google連携" },
  { id: "memoPaste", label: "メモから見つける", shortLabel: "メモ" },
  { id: "calendarImport", label: "分類テスト", shortLabel: "分類" },
  { id: "hardTime", label: "気持ち", shortLabel: "気持ち" },
  { id: "letter", label: "未来の自分へ手紙", shortLabel: "手紙" },
  { id: "oneTap", label: "ワンタップ追加", shortLabel: "拾う" },
  { id: "weekly", label: "週はじめのここまで", shortLabel: "週はじめ" },
  { id: "plus", label: "Plus案内", shortLabel: "Plus" },
] satisfies ScreenNavItem[];

export const recordCategoryLabels = {
  future: "未来に向き合った日の証拠",
  build: "積み上げた日の証拠",
  care: "自分を整えた日の証拠",
  return: "戻ってきた日の証拠",
} satisfies Record<RecordCategory, string>;

export const mockRecordSourceLabels = {
  manual: "手動追加",
  reflection: "この7日間から拾う",
  app: "アプリを開いた記録",
  calendarFile: "カレンダーファイル",
  memoPaste: "メモ貼り付け",
  letter: "手紙",
  googleCalendarMock: "Google予定（検証）",
  googleCalendar: "Googleカレンダー",
} satisfies Record<MockRecordSource, string>;

export const recordCategoryByItem: Record<string, RecordCategory> = {
  "調べた": "build",
  "勉強した": "build",
  "少し進めた": "build",
  "書いた・作った": "build",
  "応募・提出した": "future",
  "人に連絡した": "future",
  "外に出た": "care",
  "休んだ": "care",
  "生活を守った": "care",
  "ここに戻ってきた": "return",
  "ここを開いた": "return",
};

export const evidenceCategoryByItem = Object.fromEntries(
  Object.entries(recordCategoryByItem).map(([label, category]) => [
    label,
    recordCategoryLabels[category],
  ]),
) as Record<string, string>;

export function createMockRecordDraft(
  label: string,
  source: MockRecordSource,
  categoryOverride?: RecordCategory,
): MockRecordDraft {
  const category = categoryOverride ?? recordCategoryByItem[label] ?? "build";

  return {
    label,
    category,
    categoryLabel: recordCategoryLabels[category],
    source,
    dateLabel: "今日",
  };
}

export const homeCopy = {
  title: "ここまでに残っていたことを、ゆっくり見返す。",
  body:
    "進んでいないわけではありません。直近30日に残っていた行動を、無理なく確かめられる場所です。",
  counts: [
    {
      label: "未来に向き合った日",
      value: "6日",
      tone: "sage",
      category: "future",
      basis: {
        period: "直近30日",
        countingRule: "同じ日に複数あっても1日として数えます",
        sources: ["カレンダー予定", "手動追加", "アプリを開いた記録"],
        examples: ["5/2 予定を確認した", "5/5 人に連絡した", "5/9 提出準備"],
        reason:
          "「連絡」「提出」「確認」が含まれるため、この分類に入りました",
      },
    },
    {
      label: "積み上げた日",
      value: "9日",
      tone: "clay",
      category: "build",
      basis: {
        period: "直近30日",
        countingRule: "同じ日に複数あっても1日として数えます",
        sources: ["カレンダー予定", "手動追加", "アプリを開いた記録"],
        examples: ["5/4 資料を読んだ", "5/8 メモを整理した", "5/12 作業を少し進めた"],
        reason:
          "「資料」「メモ」「作業」が含まれるため、この分類に入りました",
      },
    },
    {
      label: "自分を整えた日",
      value: "4日",
      tone: "blue",
      category: "care",
      basis: {
        period: "直近30日",
        countingRule: "同じ日に複数あっても1日として数えます",
        sources: ["カレンダー予定", "手動追加", "アプリを開いた記録"],
        examples: ["5/6 買い出し", "5/11 筋トレ", "5/14 休んだ"],
        reason:
          "「買い出し」「筋トレ」「休んだ」が含まれるため、この分類に入りました",
      },
    },
    {
      label: "戻ってきた日",
      value: "2日",
      tone: "gray",
      category: "return",
      basis: {
        period: "直近30日",
        countingRule: "同じ日に複数あっても1日として数えます",
        sources: ["カレンダー予定", "手動追加", "アプリを開いた記録"],
        examples: ["5/7 ここを開いた", "5/15 ここに戻ってきた"],
        reason:
          "アプリを開いた記録や、手動で戻ってきたことを選んだ記録から入りました",
      },
    },
  ] satisfies EvidenceCount[],
  evidenceLabels: ["予定を確認した", "資料を読んだ", "メモを整理した", "作業を少し進めた"] satisfies TagItem[],
  extraEvidenceGroups: [
    {
      title: "未来に向き合ったこと",
      items: [
        { label: "予定を確認した", count: "2件" },
        { label: "人に連絡した", count: "1件" },
        { label: "提出準備", count: "2件" },
      ],
    },
    {
      title: "積み上げたこと",
      items: [
        { label: "資料を読んだ", count: "4件" },
        { label: "メモを整理した", count: "3件" },
        { label: "作業を少し進めた", count: "2件" },
      ],
    },
    {
      title: "自分を整えたこと",
      items: [
        { label: "買い出し", count: "1件" },
        { label: "筋トレ", count: "2件" },
        { label: "休んだ", count: "1件" },
      ],
    },
  ],
  closingLines: [
    "今日は、増やさなくても大丈夫です。",
    "ここまで見返せたら、それだけで十分です。",
  ],
  ctas: [
    {
      action: "navigate",
      label: "今日のことをひとつ残す",
      target: "oneTap",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "今の気持ちを整理する",
      target: "hardTime",
      variant: "secondary",
    },
    {
      action: "navigate",
      description: "今日のつらさを、あとで自分を支える言葉として残します。",
      label: "未来の自分へ手紙を書く",
      target: "letter",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const lowCountCopy = {
  title: "まだ予定には残っていないだけかもしれません。",
  body:
    "見つかった記録はまだ少しです。でも、ここを開いて、自分の足跡を見に戻ってきました。",
  note:
    "数字を先に見なくても大丈夫です。今日は、残っていないものより、ここに来られたことから見ます。",
  labels: ["ここを開いた", "生活を守った", "少し休んだ"] satisfies TagItem[],
  closingLines: [
    "数字が少ない日でも、ここに戻ってきたことは消えません。",
    "今日は見るだけでも大丈夫です。",
  ],
  ctas: [
    {
      action: "navigate",
      label: "今日のことをひとつ残す",
      target: "oneTap",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "今日は見るだけ",
      target: "home",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const reflectionCopy = {
  title: "まずは、この7日間を少しだけ振り返ってみましょう。",
  body:
    "カレンダーに習慣がなくても、短く選ぶだけで、この一週間の手がかりを作れます。",
  items: [
    "調べた",
    "勉強した",
    "応募・提出した",
    "書いた・作った",
    "人に連絡した",
    "外に出た",
    "休んだ",
    "生活を守った",
    "ここに戻ってきた",
  ] satisfies TagItem[],
  ctas: [
    {
      action: "navigate",
      label: "ここまでを作る",
      target: "home",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "カレンダー予定を確認して追加する",
      target: "googleExplain",
      variant: "secondary",
    },
  ] satisfies CtaItem[],
};

export const googleExplainCopy = {
  title: "Googleカレンダーから見つける",
  body:
    "読むもの・保存するもの・保存しないものを短く確認してから、Google連携へ進めます。",
  lines: [
    "読むもの：予定タイトルと日時",
    "保存するもの：確認した短いラベル、カテゴリ、日付",
    "保存しないもの：本文・場所・参加者・元の予定タイトル",
    "勝手に保存しません。保存前に確認できます。",
  ],
  note:
    "予定から見つかった候補は、保存前に短い言葉へ置き換えて確認します。連携しない場合も、手動で同じように見返せます。",
  ctas: [
    {
      action: "mock",
      label: "Google連携を確認する",
      mockMessage:
        "Google連携は、画面側のボタンから必要な確認だけを進めます。",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "この7日間から拾う",
      target: "reflection",
      variant: "quiet",
    },
    {
      action: "navigate",
      label: "CSV / ICSで先に試す",
      target: "calendarImport",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const calendarImportCopy = {
  title: "保存前の分類確認",
  body:
    "CSV / ICSやGoogleカレンダーから読み込んだ予定を、保存前に確認できます。この画面ではファイルをサーバーに送りません。",
  note:
    "保存前に確認できます。予定タイトルそのものは保存しません。",
  emptyMessage:
    "CSV / ICSファイルを選ぶと、保存前の分類プレビューをここに表示します。",
  readErrorMessage:
    "予定をうまく読み取れませんでした。別のCSV/ICSファイルで試すか、この7日間から拾うこともできます。",
  noEventsMessage:
    "予定らしい行を見つけられませんでした。列名やファイル形式を軽く確認して、もう一度試せます。",
  noClassifiedMessage:
    "今回は自動で保存候補にできる予定がありませんでした。低確信度の予定は保存せず、この7日間から拾うこともできます。",
  ctas: [
    {
      action: "navigate",
      label: "選んで保存する",
      target: "home",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "この7日間から拾う",
      target: "reflection",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const hardTimeCopy = {
  title: "今、つらい",
  body: "まずは近い理由を選びます。うまく言えなくても大丈夫です。",
  emotions: [
    "人と比べて落ち込んだ",
    "進んでいない気がする",
    "何もできていない気がする",
    "誰かに優しくされたい",
    "将来が不安",
    "ただ疲れた",
  ] satisfies TagItem[],
  fallbackEmotion: "今日は、苦しくなった日ですね。",
  secondLine:
    "数字を見る前に、ここに戻ってきたことを大事にしてもいい日です。",
  secondLinesByEmotion: {
    "人と比べて落ち込んだ":
      "比べてしまう日は、自分の進み方が見えにくくなります。",
    "進んでいない気がする":
      "進んでいないように見える日でも、残っていた跡があるかもしれません。",
    "何もできていない気がする":
      "できたことが小さすぎて、見えなくなっているだけかもしれません。",
    "誰かに優しくされたい":
      "今日は、自分に向ける言葉を少しだけやわらかくしてもいい日です。",
    "将来が不安":
      "先が見えない日は、ここまでに残っていた跡だけ見ても大丈夫です。",
    "ただ疲れた":
      "疲れている日は、増やすより、残っているものを静かに見るだけでも大丈夫です。",
  } as Record<string, string>,
  evidenceBridge:
    "今日のつらさとは別に、ここまで残っていた跡もあります。",
  evidenceIntro: "ここまでに残っていたこと",
  closingLines: [
    "今すぐ元気にならなくても大丈夫です。",
    "ここまで来た跡を、今日は少しだけ見られました。",
  ],
  ctas: [
    {
      action: "navigate",
      description: "今日のつらさを、あとで自分を支える言葉として残します。",
      label: "未来の自分へ手紙を書く",
      target: "letter",
      variant: "secondary",
    },
    {
      action: "navigate",
      label: "今日のことをひとつ残す",
      target: "oneTap",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "ここまで画面に戻る",
      target: "home",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
  plusLine:
    "あとで読み返せる手紙として、気持ちをやさしく整える案もあります。",
};

export const letterCopy = {
  title: "未来の自分へ、少しだけ言葉を残す。",
  body:
    "今の気持ちをきれいにまとめなくても大丈夫です。明日の自分に、少しだけ渡しておけます。",
  prompts: [
    "今日の自分に、ひとこと声をかけるなら？",
    "今、何が少し重く感じていますか？",
    "ここまで来た自分に、残しておきたいことは？",
    "明日の自分に渡すなら、どんな言葉にしますか？",
  ] satisfies TagItem[],
  placeholder:
    "例：今日は少し苦しかった。ここを開いて、今の気持ちを少しだけ置いておく。",
  emptyHint: "一文だけでも大丈夫です。",
  savedRecordLabel: "未来の自分へ手紙を書いた",
  ctas: [
    {
      action: "navigate",
      label: "手紙を残す",
      target: "home",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "今日は書かずに戻る",
      target: "home",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const oneTapCopy = {
  title: "今日のことをひとつ残す",
  body:
    "日記にしなくて大丈夫です。近いものをひとつ選び、必要なら短い一言だけ添えて残します。",
  items: [
    "調べた",
    "少し進めた",
    "書いた・作った",
    "応募・提出した",
    "人に連絡した",
    "外に出た",
    "休んだ",
    "生活を守った",
    "ここを開いた",
  ] satisfies TagItem[],
  pickedTitle: "選んだこと",
  ctas: [
    {
      action: "mock",
      label: "この内容で追加する",
      mockMessage:
        "選んだ内容を保存し、追加完了カードで追加先を確認する導線です。",
      variant: "primary",
    },
    {
      action: "mock",
      label: "続けて追加する",
      mockMessage:
        "追加後に同じ画面でもう一度選び直す導線です。",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const weeklyCopy = {
  title: "週はじめのここまで",
  body: "先週も、ちゃんと向き合っていました。",
  counts: [
    { label: "未来に向き合った日", value: "2日", tone: "sage" },
    { label: "積み上げた日", value: "4日", tone: "clay" },
    { label: "自分を整えた日", value: "1日", tone: "blue" },
  ] satisfies EvidenceCount[],
  evidenceLabels: ["予定を確認した", "作業を少し進めた", "運動"] satisfies TagItem[],
  note:
    "今週は、全部を増やさなくても大丈夫です。ここまで残っているものがあります。",
  ctas: [
    {
      action: "navigate",
      label: "今週のここまでを見る",
      target: "home",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "Plusの内容を見る",
      target: "plus",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};

export const plusCopy = {
  title: "週ごとのまとめも受け取れます。",
  body:
    "本番では、無料の体験で価値を確かめた後に表示する想定です。",
  price: "価格は検証中です",
  features: [
    "週ごとのここまで",
    "月ごとのふり返り",
    "挑戦前に見返すまとめ",
    "90日〜1年の長めの履歴",
    "短く残したラベル履歴",
    "分類カスタム",
    "AI手紙整え",
    "AIレポート生成",
  ] satisfies TagItem[],
  timingNote:
    "必要になった時だけ見られるように、最初は強く出さない想定です。",
  note:
    "AIは気持ちを決めつけるためではなく、あなたが残した行動と言葉を読みやすく整える補助として置いています。",
  ctas: [
    {
      action: "navigate",
      label: "Plusの考え方を見る",
      target: "plus",
      variant: "primary",
    },
    {
      action: "navigate",
      label: "今は無料で使う",
      target: "home",
      variant: "quiet",
    },
  ] satisfies CtaItem[],
};
