import type { UIStrings } from "./index";
import { en } from "./en";

/** Russian UI strings. Machine-written and unreviewed by a native speaker — see the
 *  proofreading note in CONTRIBUTING.md.
 *
 *  Russian has three plural forms; `plural` picks one by the usual rule (one for a count
 *  ending in 1 but not 11, few for 2–4 but not 12–14, many otherwise). The counters below
 *  use it; where a count sits after a preposition that forces the genitive, the "few" and
 *  "many" forms are set equal so the phrase still reads. */
const plural = (n: number, one: string, few: string, many: string): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

export const ru: UIStrings = {
  header: {
    taglineBefore: "Создавайте свои списки слов для",
    taglineAfter: "и похожих игр в слова.",
  },
  tree: {
    topics: "Темы",
    loading: "Загрузка тем…",
    loadError: (message) => `Не удалось загрузить темы: ${message}`,
    empty: "Пока нет доступных тем.",
    toggle: (expanded, title) => `${expanded ? "Свернуть" : "Развернуть"} ${title}`,
    loadingShort: "загрузка…",
    wordsOf: (selected, total) => `${selected} из ${total} ${plural(total, "слова", "слов", "слов")}`,
  },
  names: {
    form: { pref: "основная", short: "краткая", long: "полная", both: "обе", all: "все" },
    formLabel: (group) => `Форма имени для: ${group}`,
  },
  fame: {
    depthLabel: (group) => `Глубина известности для: ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `верхний уровень из ${total}` : `верхние ${depth} из ${total} уровней`,
    groupsDefined: (count) => `Определено групп известности: ${count}`,
    none: "Группы известности ещё не заданы — предложите их через Contribution Guide в нижнем колонтитуле!",
    selected: "Выбрано:",
    mostlySelected: "В основном выбрано:",
    stored: (body) => `(Сохранено: ${body})`,
    toggle: (shown) =>
      shown ? "Скрыть шкалу известности этого списка" : "Показать шкалу известности этого списка",
    toggleAll: (allShown) =>
      allShown ? "Скрыть эти шкалы известности" : "Показать эти шкалы известности",
  },
  omitted: {
    label: "Что этот список не включает",
    title: "Исключено из этого списка:",
    toggle: (omitted) =>
      omitted ? "Включить их в ваш список" : "Оставить их за пределами списка",
    locked: "Это игровые данные, а не слова, поэтому их нельзя добавить.",
    upTo: (n) => `До ${n}`,
    unknown: (n, primary, secondary) =>
      `До ${n} ${plural(n, "записи", "записей", "записей")} без имени на «${primary}${secondary}» в исходных данных`,
    unknownHint: (omitted) =>
      omitted
        ? "Включить их под английскими именами — единственными известными для них."
        : "Снова исключить их.",
    unknownTier: (tier, n) => `Уровень ${tier}: ${n} ${plural(n, "запись", "записи", "записей")}`,
    tooLong: (n, maxLen) => `До ${n} ${plural(n, "имени", "имён", "имён")} длиннее ${maxLen} символов`,
    tooLongHint: (omitted) =>
      omitted
        ? "Всё равно включить их — skribbl.io их не примет, но другая игра может."
        : "Снова исключить их.",
    helpAdd: (url) => ` — [помогите добавить недостающее!](${url})`,
  },
  // custom: English stopgap until the UI-language PR translates it (§X).
  custom: en.custom,
  coverage: {
    label: "Geoguessr / покрытие Street View",
    all: "Все страны",
    withCoverage: "С официальным покрытием",
    reliable: "Только надёжное покрытие",
  },
  languageType: {
    label: "Какие типы языков включать",
    base: "Живые современные языки",
    submillion: "Также языки с менее чем 1 млн носителей",
    notRecommended: "Плохо подходит для непринуждённого рисования: гораздо менее известен, чем можно судить по числу носителей.",
    toggle: (included) =>
      included
        ? "Отмечено — они в списке. Снимите отметку, чтобы исключить."
        : "Отметьте, чтобы добавить их в список.",
  },
  sovereignty: {
    label: "Суверенитет и признание",
    wiki: "https://ru.wikipedia.org/wiki/Список_государств_с_ограниченным_признанием",
    axisRow: "де-юре",
    axisCol: "де-факто",
    cols: ["Полная независимость", "Частичная автономия"],
    rows: ["Всеобщее признание", "Широкое признание", "Частичное признание", "Без признания"],
    colDefs: [
      "Само управляет границами, судами, армией и налогами.",
      "Имеет собственные законы и парламент, но разделяет ключевые полномочия — валюту, оборону, внешнюю политику — с другим государством.",
    ],
    rowDefs: [
      "Государство — член ООН, признанное практически всеми остальными.",
      "Признано значительной частью членов ООН, при наличии противников.",
      "Признано лишь несколькими государствами, но часто с заметным фактическим или воспринимаемым присутствием.",
      "На международном уровне считается частью другого суверенного государства.",
    ],
    regular: "Обычные государства",
  },
  language: {
    label: (current) => `Язык: ${current}`,
    menu: "Язык",
    unsupported: (language) => `Пока не подтверждено для языка «${language}» — эта тема может быть неполной.`,
    fallback: "Там, где перевода нет, используется английский.",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary} официально тоже использует английские названия.`,
    variant: {
      romaji: "Использовать ромадзи для записей списка",
      es419: "Использовать латиноамериканский испанский для записей списка",
    },
    variantNote: { romaji: "Написание по Хепбёрну с удвоением долгих гласных (Moomoomiruku).{br}Ромадзи в стиле вапуро не предлагается: оно переопределило бы официальное написание — Butterfree, а не Batafurii." },
    generatedRomaji:
      "Эти ромадзи сгенерированы из японских названий. Если где-то написание на практике другое, [сообщите нам](https://github.com/Trummler12/custom-wordlists/issues/new).",
    variantDiffers: (n) => `${n} ${plural(n, "запись", "записи", "записей")} с другим написанием`,
    variantShowList: "Показать какие",
    useEnglish: (forced) =>
      forced ? "Показывать этот список на выбранном языке" : "Использовать английские записи этого списка",
    useEnglishAll: (allForced) =>
      allForced
        ? "Показывать эти списки на выбранном языке"
        : "Использовать английские записи этих списков",
  },
  settings: {
    label: "Настройки",
    showEnglish: "Показать опцию использования английских записей",
    showEnglishEn: "Эти переключатели появляются только для языков, отличных от английского.",
    interfaceLang: "Язык интерфейса:",
    interfaceAuto: "Автоматически",
    reset: "Сбросить настройки{br}по умолчанию",
    resetConfirm: "Нажмите ещё раз для подтверждения",
    resetCancel: "Отмена",
  },
  output: {
    label: "Результат",
    copy: "Копировать",
    copied: "Скопировано!",
    copyFailed: "Не удалось скопировать",
    copyManual: "Список выделен — скопируйте его сами.",
    empty: "Выберите темы или группы, чтобы составить список.",
    generatedList: "Сгенерированный список слов",
    words: "слов",
    chars: "симв.",
    belowMin: (min) => `· меньше минимума skribbl (${min})`,
    overMax: "· больше максимума",
    overLong: (count, maxLen) =>
      `${count} ${plural(count, "слово", "слова", "слов")} длиннее ${maxLen} символов`,
  },
  footer: {
    repository: "Репозиторий GitHub",
    helpOut: "Хотите помочь проекту? Загляните в",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
  coveragePage: {
    home: "На главную",
    topicLabel: "Тема:",
    uiLanguage: "Язык интерфейса",
    title: "Языковое покрытие",
    intro: "Выберите тему, чтобы увидеть, для каких языков у Wikidata уже есть метка по каждому элементу.",
    lead: "Содержимое этой темы взято из [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). В таблице показано, для каких языков у каждого элемента уже есть метка.",
    notesTitle: "Как помочь",
    noteAdd: "Откройте элемент из первого столбца и, войдя в систему, добавьте любую недостающую метку, в которой вы уверены.",
    noteLabelLister: "Чтобы добавить язык, которого нет в списке вовсе, включите гаджет labelLister в своих [настройках Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets), в разделе «Гаджеты»; тогда у каждого элемента появится «Labels list» (вверху справа, в разделе «Инструменты»), принимающий любой языковой код.",
    noteProtected: "Некоторые элементы Wikidata защищены, и для их изменения нужна учётная запись возрастом не менее четырёх дней и со 100 или более правками.",
    noteStale: "Учтите, что эта таблица получена из ручного дампа, поэтому показанное здесь покрытие может отставать от текущего состояния Wikidata на несколько недель.",
    itemCount: (n) => `${n.toLocaleString()} ${plural(n, "элемент", "элемента", "элементов")}`,
    uiOnly: "Только языки интерфейса",
    uiOnlyHint: "Сырые дампы данных уже охватывают все языки, которые поддерживает skribbl.io,{br}плюс ещё несколько с большим числом пользователей.{br}То есть данные уже поддерживают все запланированные языки,{br}тогда как интерфейс мы, сопровождающие, ведём вручную, и он естественно сильно отстаёт.{br}К тому же мало смысла добавлять новый язык интерфейса,{br}пока почти ни одна тема ещё не покрывает этот язык.{br}Но чем больше людей помогает, тем скорее одобряют новые языки!{br}=> Загляните в Contribution Guide ниже!",
    item: "Элемент",
    numeric: { population: "Население", area: "Площадь (км²)", users: "Пользователи" },
    first: "Первая страница",
    prev: "Предыдущая страница",
    next: "Следующая страница",
    last: "Последняя страница",
    page: (current, total) => `Страница ${current} / ${total}`,
    loading: (topic) => `Загрузка «${topic}»…`,
    loadError: (topic, message) => `Не удалось загрузить покрытие для «${topic}»: ${message}`,
  },
};
