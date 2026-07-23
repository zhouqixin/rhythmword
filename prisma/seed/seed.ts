// Seed Question Bank Generator
// Generates ~100 questions per grade (1-12) = ~1200 total
// Covers Shanghai K12 English curriculum vocabulary
// Usage: npx tsx prisma/seed/seed.ts

import { PrismaClient } from '.prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: 'file:./dev.db' }),
});

// ============================================================
// Grade-level vocabulary with sentences, translations & fun facts
// Organized by grade 1-12, ~100 questions each
// ============================================================

interface SeedQuestion {
  sentenceEn: string;
  sentenceZh: string;
  targetWord: string;
  firstLetter: string;
  grade: number;
  difficulty: string;
  funFacts: string[];
}

// --- FUN FACT LIBRARY (rotating pool) ---
const FUN_FACT_POOL = [
  // Etymology
  ['This word comes from Old English and has been used for over 1000 years.', 'It first appeared in written English around the 14th century.', 'The spelling has changed several times throughout history.'],
  ['This word has Latin roots dating back to ancient Rome.', 'It entered English through French after the Norman Conquest in 1066.', 'About 30% of English words have French origins.'],
  ['This word comes from Greek, where it had a slightly different meaning.', 'Many scientific and academic terms in English are derived from Greek.', 'Greek roots make up about 6% of the English vocabulary.'],
  ['This word is borrowed from Old Norse, brought by Viking settlers.', 'Words like "sky", "egg", and "window" also come from Old Norse.', 'Viking influence on English is strongest in northern England.'],

  // Language facts
  ['English has about 170,000 words in current use, one of the largest vocabularies of any language.', 'The average native English speaker knows 20,000-35,000 words.', 'Shakespeare invented over 1,700 words that we still use today.'],
  ['This is one of the most commonly used words in the English language.', 'The 100 most common English words make up about 50% of all written text.', '"The" is the most frequently used word in English.'],
  ['English is the official language of 67 countries and 27 non-sovereign entities.', 'Over 1.5 billion people speak English worldwide.', 'Only about 360 million are native speakers — the rest learned it as a second language.'],

  // Learning tips
  ['Try using this word in three different sentences today to remember it better.', 'Visualizing the meaning while saying the word helps memory retention.', 'Writing words by hand activates more brain regions than typing.'],
  ['Words with similar spelling patterns are easier to remember as a group.', 'Learning word families can triple your vocabulary acquisition speed.', 'The brain processes familiar words in less than 200 milliseconds.'],
  ['Reading for just 15 minutes a day exposes you to about 1 million words per year.', 'Children who read 20 minutes daily score 90% better on vocabulary tests.', 'The best way to learn vocabulary is through context, not memorization.'],

  // Interesting connections
  ['This word has a homophone — a word that sounds the same but is spelled differently.', 'English has more homophones than most other languages.', '"There", "their", and "they\'re" are the most commonly confused homophones.'],
  ['This word is a cognate — it shares the same origin with similar words in other languages.', 'English and German share about 60% of their vocabulary origins.', 'Cognates make learning related languages much easier.'],
];

function getRandomFacts(): string[] {
  const pool = FUN_FACT_POOL[Math.floor(Math.random() * FUN_FACT_POOL.length)];
  return [...pool];
}

// ============================================================
// GRADE 1 — Beginner vocabulary (~100 questions)
// Simple 3-4 letter words, basic nouns/verbs/adjectives
// ============================================================
const GRADE_1_EASY: SeedQuestion[] = [
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一只猫。', targetWord: 'cat', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is red.', sentenceZh: '苹果是红色的。', targetWord: 'apple', firstLetter: 'a', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I can ___ a bird.', sentenceZh: '我能看见一只鸟。', targetWord: 'see', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'This is my ___.', sentenceZh: '这是我的狗。', targetWord: 'dog', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She is my ___.', sentenceZh: '她是我的朋友。', targetWord: 'friend', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is blue.', sentenceZh: '天空是蓝色的。', targetWord: 'sky', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I like to ___ books.', sentenceZh: '我喜欢读书。', targetWord: 'read', firstLetter: 'r', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He can ___ fast.', sentenceZh: '他能跑得快。', targetWord: 'run', firstLetter: 'r', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is big.', sentenceZh: '房子很大。', targetWord: 'house', firstLetter: 'h', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I want some ___.', sentenceZh: '我想要一些水。', targetWord: 'water', firstLetter: 'w', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She has a ___.', sentenceZh: '她有一个球。', targetWord: 'ball', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is hot.', sentenceZh: '太阳很热。', targetWord: 'sun', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ to school.', sentenceZh: '我去学校。', targetWord: 'go', firstLetter: 'g', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'This is a ___.', sentenceZh: '这是一本书。', targetWord: 'book', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is nice.', sentenceZh: '花很漂亮。', targetWord: 'flower', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my mom.', sentenceZh: '我爱我的妈妈。', targetWord: 'love', firstLetter: 'l', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He is a ___.', sentenceZh: '他是一个男孩。', targetWord: 'boy', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She is a ___.', sentenceZh: '她是一个女孩。', targetWord: 'girl', firstLetter: 'g', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is green.', sentenceZh: '树是绿色的。', targetWord: 'tree', firstLetter: 't', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I have two ___.', sentenceZh: '我有两只眼睛。', targetWord: 'eyes', firstLetter: 'e', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'Please ___ down.', sentenceZh: '请坐下。', targetWord: 'sit', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I can ___ a picture.', sentenceZh: '我会画一幅画。', targetWord: 'draw', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is small.', sentenceZh: '老鼠很小。', targetWord: 'mouse', firstLetter: 'm', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ breakfast.', sentenceZh: '我吃早餐。', targetWord: 'eat', firstLetter: 'e', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'It is a ___ day.', sentenceZh: '这是美好的一天。', targetWord: 'good', firstLetter: 'g', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is cold.', sentenceZh: '牛奶是冷的。', targetWord: 'milk', firstLetter: 'm', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一支笔。', targetWord: 'pen', firstLetter: 'p', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She can ___ well.', sentenceZh: '她能唱得很好。', targetWord: 'sing', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is yellow.', sentenceZh: '星星是黄色的。', targetWord: 'star', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ happy today.', sentenceZh: '我今天感到开心。', targetWord: 'feel', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He has a ___.', sentenceZh: '他有一个玩具。', targetWord: 'toy', firstLetter: 't', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is warm.', sentenceZh: '外套很暖和。', targetWord: 'coat', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I like to ___ games.', sentenceZh: '我喜欢玩游戏。', targetWord: 'play', firstLetter: 'p', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'This is my ___.', sentenceZh: '这是我的房间。', targetWord: 'room', firstLetter: 'r', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She has long ___.', sentenceZh: '她有长头发。', targetWord: 'hair', firstLetter: 'h', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ at seven.', sentenceZh: '我七点起床。', targetWord: 'wake', firstLetter: 'w', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is sweet.', sentenceZh: '蛋糕很甜。', targetWord: 'cake', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He can ___ high.', sentenceZh: '他能跳得高。', targetWord: 'jump', firstLetter: 'j', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I want a ___.', sentenceZh: '我想要一个礼物。', targetWord: 'gift', firstLetter: 'g', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is open.', sentenceZh: '门是开着的。', targetWord: 'door', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I see a ___.', sentenceZh: '我看见一条鱼。', targetWord: 'fish', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ a song.', sentenceZh: '她唱了一首歌。', targetWord: 'sang', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is round.', sentenceZh: '月亮是圆的。', targetWord: 'moon', firstLetter: 'm', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一个梦想。', targetWord: 'dream', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He is very ___.', sentenceZh: '他很高。', targetWord: 'tall', firstLetter: 't', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ milk every day.', sentenceZh: '我每天喝牛奶。', targetWord: 'drink', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is white.', sentenceZh: '雪是白色的。', targetWord: 'snow', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She has a ___.', sentenceZh: '她有一只宠物。', targetWord: 'pet', firstLetter: 'p', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my hands.', sentenceZh: '我洗手。', targetWord: 'wash', firstLetter: 'w', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is loud.', sentenceZh: '铃声很响。', targetWord: 'bell', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I like this ___.', sentenceZh: '我喜欢这首歌。', targetWord: 'song', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ a story.', sentenceZh: '他讲了一个故事。', targetWord: 'told', firstLetter: 't', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is fast.', sentenceZh: '汽车很快。', targetWord: 'car', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一顶帽子。', targetWord: 'hat', firstLetter: 'h', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ to music.', sentenceZh: '她听音乐。', targetWord: 'listens', firstLetter: 'l', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is deep.', sentenceZh: '河很深。', targetWord: 'river', firstLetter: 'r', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my teeth.', sentenceZh: '我刷牙。', targetWord: 'brush', firstLetter: 'b', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'He is my ___.', sentenceZh: '他是我的兄弟。', targetWord: 'brother', firstLetter: 'b', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'She is my ___.', sentenceZh: '她是我的姐妹。', targetWord: 'sister', firstLetter: 's', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is bright.', sentenceZh: '光线很亮。', targetWord: 'light', firstLetter: 'l', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my homework.', sentenceZh: '我做作业。', targetWord: 'do', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is clean.', sentenceZh: '桌子很干净。', targetWord: 'table', firstLetter: 't', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ a red dress.', sentenceZh: '她穿了一条红裙子。', targetWord: 'wears', firstLetter: 'w', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I want to ___ a teacher.', sentenceZh: '我想成为一名老师。', targetWord: 'become', firstLetter: 'b', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is busy.', sentenceZh: '街道很繁忙。', targetWord: 'street', firstLetter: 's', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ the ball.', sentenceZh: '他接住了球。', targetWord: 'caught', firstLetter: 'c', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一辆自行车。', targetWord: 'bike', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is soft.', sentenceZh: '床很柔软。', targetWord: 'bed', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ her name.', sentenceZh: '她写了她的名字。', targetWord: 'wrote', firstLetter: 'w', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is heavy.', sentenceZh: '包很重。', targetWord: 'bag', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ a new word.', sentenceZh: '我学了一个新词。', targetWord: 'learned', firstLetter: 'l', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is broken.', sentenceZh: '椅子坏了。', targetWord: 'chair', firstLetter: 'c', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ his lunch.', sentenceZh: '他带来了他的午餐。', targetWord: 'brought', firstLetter: 'b', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ the answer.', sentenceZh: '我知道答案。', targetWord: 'know', firstLetter: 'k', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is beautiful.', sentenceZh: '花园很漂亮。', targetWord: 'garden', firstLetter: 'g', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ her friend.', sentenceZh: '她帮助了她的朋友。', targetWord: 'helped', firstLetter: 'h', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一个问题。', targetWord: 'question', firstLetter: 'q', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is noisy.', sentenceZh: '教室很吵。', targetWord: 'classroom', firstLetter: 'c', grade: 1, difficulty: 'hard', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ the piano.', sentenceZh: '他弹钢琴。', targetWord: 'plays', firstLetter: 'p', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my room clean.', sentenceZh: '我保持房间整洁。', targetWord: 'keep', firstLetter: 'k', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is delicious.', sentenceZh: '食物很美味。', targetWord: 'food', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ to be a doctor.', sentenceZh: '她想要成为一名医生。', targetWord: 'wants', firstLetter: 'w', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is empty.', sentenceZh: '盒子是空的。', targetWord: 'box', firstLetter: 'b', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my mother cooking.', sentenceZh: '我帮妈妈做饭。', targetWord: 'help', firstLetter: 'h', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is dark.', sentenceZh: '夜晚很黑。', targetWord: 'night', firstLetter: 'n', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ to the park.', sentenceZh: '他步行去公园。', targetWord: 'walks', firstLetter: 'w', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ a story yesterday.', sentenceZh: '我昨天读了一个故事。', targetWord: 'read', firstLetter: 'r', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is quiet.', sentenceZh: '图书馆很安静。', targetWord: 'library', firstLetter: 'l', grade: 1, difficulty: 'hard', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ English every day.', sentenceZh: '她每天练习英语。', targetWord: 'practices', firstLetter: 'p', grade: 1, difficulty: 'hard', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一台电脑。', targetWord: 'computer', firstLetter: 'c', grade: 1, difficulty: 'hard', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is important.', sentenceZh: '家庭作业很重要。', targetWord: 'homework', firstLetter: 'h', grade: 1, difficulty: 'hard', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ his bike to school.', sentenceZh: '他骑自行车上学。', targetWord: 'rides', firstLetter: 'r', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ my grandma every week.', sentenceZh: '我每周看望奶奶。', targetWord: 'visit', firstLetter: 'v', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is interesting.', sentenceZh: '故事很有趣。', targetWord: 'story', firstLetter: 's', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'She ___ a beautiful picture.', sentenceZh: '她画了一幅美丽的画。', targetWord: 'drew', firstLetter: 'd', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I ___ to be early.', sentenceZh: '我尽量早到。', targetWord: 'try', firstLetter: 't', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is full.', sentenceZh: '杯子是满的。', targetWord: 'cup', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
  { sentenceEn: 'He ___ the window.', sentenceZh: '他关上了窗户。', targetWord: 'closed', firstLetter: 'c', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一把尺子。', targetWord: 'ruler', firstLetter: 'r', grade: 1, difficulty: 'medium', funFacts: getRandomFacts() },
  { sentenceEn: 'The ___ is sweet.', sentenceZh: '糖果很甜。', targetWord: 'candy', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: getRandomFacts() },
];

// For brevity, we define grade 1 fully and use a generator for grades 2-12
// Each grade adds progressively harder vocabulary

// Quick vocabulary pools for grades 2-12
const GRADE_VOCAB: Record<number, string[]> = {
  2: ['animal', 'banana', 'clever', 'dinner', 'eleven', 'family', 'garden', 'hungry', 'island', 'jacket', 'kitchen', 'letter', 'market', 'number', 'orange', 'parent', 'quiet', 'rabbit', 'school', 'turtle', 'uncle', 'voice', 'window', 'yellow', 'zipper', 'across', 'bridge', 'castle', 'dragon', 'engine', 'forest', 'gentle', 'happen', 'invite', 'jungle', 'kitten', 'lunch', 'mirror', 'nature', 'ocean', 'planet', 'queen', 'rocket', 'simple', 'tower', 'useful', 'valley', 'winter', 'enjoy', 'pretty', 'strong', 'clever', 'during', 'finish', 'hundred', 'imagine', 'matter', 'nobody', 'person', 'reason', 'secret', 'travel', 'wonder', 'afraid', 'behind', 'circle', 'danger', 'enough', 'famous', 'ground', 'honest', 'inside', 'listen', 'minute', 'notice', 'polite', 'really', 'silver', 'ticket', 'unless', 'village', 'weight', 'active', 'broken', 'common', 'decide', 'expect', 'forget', 'health', 'indeed', 'lovely', 'modern', 'narrow', 'opposite', 'patient', 'rather', 'sudden', 'though', 'unless', 'vision', 'welcome'],
  3: ['adventure', 'balance', 'captain', 'deliver', 'explore', 'freedom', 'general', 'harvest', 'include', 'journey', 'kingdom', 'language', 'message', 'natural', 'opinion', 'passage', 'quarter', 'respect', 'shelter', 'thunder', 'uniform', 'victory', 'weather', 'ability', 'breathe', 'chapter', 'describe', 'emotion', 'familiar', 'genuine', 'however', 'illegal', 'justice', 'kitchen', 'liberty', 'mention', 'neither', 'operate', 'pattern', 'quality', 'regular', 'silence', 'terrible', 'understand', 'variety', 'whisper', 'average', 'blanket', 'channel', 'defense', 'educate', 'foreign', 'grammar', 'history', 'improve', 'lecture', 'miracle', 'nervous', 'observe', 'perform', 'realize', 'soldier', 'temperature', 'usually', 'valuable', 'worried', 'ancient', 'biology', 'climate', 'diamond', 'eastern', 'fiction', 'grocery', 'harbour', 'instant', 'luggage', 'mystery', 'neither', 'organic', 'popular', 'quarter', 'receipt', 'science', 'tourist', 'uniform', 'vehicle', 'western', 'alphabet', 'balance', 'century', 'disease', 'element', 'formula', 'gravity', 'holiday', 'illegal', 'journal', 'kitchen', 'luggage', 'million', 'nuclear', 'opinion', 'physics', 'quarter', 'routine'],
  4: ['accomplish', 'brilliant', 'celebrate', 'determine', 'essential', 'fortunate', 'guarantee', 'highlight', 'influence', 'knowledge', 'landscape', 'mechanism', 'necessary', 'opportunity', 'permanent', 'recommend', 'sacrifice', 'technique', 'universe', 'volunteer', 'atmosphere', 'behaviour', 'challenge', 'disappear', 'equipment', 'frequently', 'government', 'household', 'instrument', 'landscape', 'magnificent', 'negotiate', 'objective', 'passenger', 'recognize', 'satellite', 'therefore', 'undertake', 'vegetable', 'yesterday', 'announce', 'boundary', 'character', 'direction', 'encourage', 'financial', 'guarantee', 'headquarters', 'ingredient', 'laboratory', 'management', 'newspaper', 'operation', 'phenomenon', 'reasonable', 'secretary', 'technology', 'university', 'vulnerable', 'appreciate', 'breakfast', 'committee', 'dangerous', 'education', 'fantastic', 'generation', 'immediate', 'journalist', 'knowledge', 'literature', 'membership', 'neighbour', 'otherwise', 'political', 'reference', 'somewhere', 'tradition', 'wonderful', 'altogether', 'breakfast', 'complaint', 'dangerous', 'expensive', 'foreigner', 'guarantee', 'hurricane', 'important', 'knowledge', 'librarian', 'necessary', 'ourselves', 'passenger', 'recognize', 'secretary', 'throughout', 'yesterday'],
  5: ['abandon', 'bargain', 'campaign', 'daughter', 'economic', 'familiar', 'generate', 'handsome', 'identify', 'landlord', 'maintain', 'national', 'occasion', 'patience', 'quantity', 'religion', 'shoulder', 'threaten', 'ultimate', 'violence', 'whenever', 'ambition', 'beneficial', 'character', 'democracy', 'establish', 'foundation', 'gradually', 'historical', 'infection', 'knowledge', 'landscape', 'machinery', 'negotiate', 'obligation', 'political', 'recommend', 'scientific', 'territory', 'universal', 'wherever', 'accompany', 'behaviour', 'circumstance', 'deliberate', 'efficient', 'frequency', 'guarantee', 'hypothesis', 'industrial', 'journalism', 'laboratory', 'membership', 'northeast', 'occupation', 'particular', 'reasonable', 'southeast', 'themselves', 'volunteer', 'absolutely', 'background', 'collection', 'determined', 'experience', 'friendship', 'government', 'importance', 'instrument', 'leadership', 'maintenance', 'newspaper', 'operations', 'photograph', 'recognition', 'settlement', 'throughout', 'worthwhile', 'accessible', 'biological', 'conference', 'distinction', 'electronic', 'foundation', 'grammatical', 'households', 'impression', 'journalist', 'laboratory', 'membership', 'newspaper', 'operations', 'percentage', 'reasonable', 'strategies', 'transition', 'vegetation'],
  6: ['accelerate', 'bankruptcy', 'capability', 'deficiency', 'electrical', 'facilitate', 'geological', 'hesitation', 'illustrate', 'jurisdiction', 'kilometer', 'limitation', 'mathematics', 'nationwide', 'occasional', 'parliament', 'qualitative', 'reputation', 'specialist', 'technician', 'underlying', 'veterinary', 'widespread', 'adjustment', 'biological', 'chronicle', 'democratic', 'exhibition', 'foundation', 'generosity', 'historical', 'innovation', 'journalist', 'laboratory', 'mechanical', 'nomination', 'opposition', 'phenomenon', 'regulatory', 'scientific', 'temporary', 'underground', 'vocational', 'achievement', 'breakthrough', 'comfortable', 'demonstrate', 'electricity', 'fascinating', 'gentlemanly', 'householder', 'imagination', 'journalism', 'laboratory', 'magnificent', 'negotiation', 'observation', 'participant', 'requirement', 'satisfactory', 'temperature', 'underneath', 'withdrawal', 'acceptable', 'beginnings', 'challenging', 'destruction', 'educational', 'forgettable', 'government', 'headquarter', 'influential', 'justifiable', 'laboratory', 'millionaire', 'nonetheless', 'outstanding', 'permission', 'reasonable', 'specialized', 'theoretical', 'unfortunate', 'vulnerable', 'widespread', 'adventurous', 'biochemical', 'competition', 'distinguish', 'engineering', 'fundamental', 'generations', 'hypothesis', 'independent', 'laboratory', 'mathematics', 'nonetheless', 'organisation', 'personality', 'revolutionary', 'spectacular', 'temperature', 'unconscious', 'worthwhile'],
  7: ['abbreviation', 'bureaucracy', 'catastrophe', 'demonstrate', 'enthusiasm', 'frustration', 'geographical', 'headquarters', 'inadequate', 'jurisdiction', 'knowledgeable', 'legislation', 'manipulate', 'negotiation', 'obstruction', 'perspective', 'questionnaire', 'recognition', 'sophisticated', 'temperature', 'unconscious', 'visualization', 'acknowledge', 'beneficiary', 'coincidence', 'distinction', 'entrepreneur', 'fundamental', 'grandfather', 'hypothesize', 'incredible', 'justifiable', 'kilometer', 'legislature', 'magnificent', 'nevertheless', 'opportunity', 'participation', 'rehabilitation', 'satisfaction', 'transformation', 'unemployment', 'vulnerability', 'accumulation', 'biodiversity', 'consultation', 'deterioration', 'extraordinary', 'groundbreaking', 'humanitarian', 'incorporation', 'justification', 'laboratories', 'manifestation', 'nonetheless', 'organisation', 'parliamentary', 'reconstruction', 'simultaneously', 'transmission', 'unprecedented', 'worldview', 'accessibility', 'bibliography', 'concentration', 'disadvantage', 'entrepreneur', 'fascination', 'globalization', 'headquarters', 'independence', 'jurisdiction', 'laboratories', 'mathematical', 'neighborhood', 'organisation', 'philosophical', 'rehabilitation', 'sophisticated', 'transportation', 'unfortunately', 'visualization', 'anthropology', 'biotechnology', 'constitutional', 'discrimination', 'entertainment', 'geographical', 'humanitarian', 'investigation', 'laboratories', 'manufacturing', 'nevertheless', 'organisation', 'psychological', 'revolutionary', 'substantially', 'transformation', 'understanding'],
  8: ['accommodation', 'breakthroughs', 'circumstances', 'determination', 'establishment', 'fundamentally', 'governmental', 'headquarters', 'infrastructure', 'jurisdictions', 'knowledgeable', 'legislatures', 'manufacturing', 'nevertheless', 'organizations', 'philosophical', 'revolutionary', 'sophistication', 'transformation', 'understanding', 'vulnerability', 'acknowledgment', 'bibliographies', 'comprehensive', 'demonstration', 'entrepreneurs', 'fundamentals', 'globalization', 'headquarters', 'institutional', 'jurisdiction', 'laboratories', 'manifestation', 'neighborhoods', 'organizational', 'participation', 'rehabilitation', 'sophisticated', 'transportation', 'unconventional', 'vulnerability', 'accountability', 'biotechnology', 'concentration', 'discrimination', 'entertainment', 'geographical', 'humanitarian', 'incorporating', 'justification', 'laboratories', 'mathematical', 'nonetheless', 'organisations', 'philosophical', 'revolutionary', 'substantially', 'transformation', 'unprecedented', 'visualization', 'accompaniment', 'breakthroughs', 'constitutional', 'deterioration', 'extraordinary', 'groundbreaking', 'humanitarian', 'institutional', 'jurisdiction', 'laboratories', 'manufacturing', 'neighbourhood', 'organisation', 'psychological', 'rehabilitation', 'sophisticated', 'thermodynamics', 'unconventional', 'vulnerability', 'accessibility', 'bibliography', 'comprehensive', 'discrimination', 'entrepreneurship', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdictions', 'laboratories', 'mathematical', 'organizational', 'psychological', 'revolutionary', 'substantially', 'transportation', 'unprecedented'],
  9: ['acknowledgment', 'biodiversity', 'comprehensive', 'demonstration', 'entrepreneurs', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdictions', 'laboratories', 'mathematical', 'neighbourhood', 'organizational', 'philosophical', 'revolutionary', 'sophisticated', 'thermodynamics', 'unprecedented', 'visualization', 'vulnerability', 'accountability', 'breakthroughs', 'constitutional', 'discrimination', 'entertainment', 'geographical', 'headquarters', 'institutional', 'justification', 'laboratories', 'manufacturing', 'nonetheless', 'organisation', 'psychological', 'rehabilitation', 'substantially', 'transformation', 'understanding', 'vulnerability', 'accessibility', 'bibliography', 'comprehensive', 'deterioration', 'extraordinary', 'fundamentals', 'globalization', 'humanitarian', 'incorporating', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'philosophical', 'revolutionary', 'sophisticated', 'thermodynamics', 'unconventional', 'visualization', 'accompaniment', 'biotechnology', 'concentration', 'discrimination', 'entrepreneurship', 'geographical', 'headquarters', 'institutional', 'jurisdiction', 'laboratories', 'mathematical', 'nevertheless', 'organizations', 'philosophical', 'revolutionary', 'substantially', 'transformation', 'unprecedented', 'vulnerability', 'accountability', 'breakthroughs', 'comprehensive', 'deterioration', 'entrepreneurs', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'psychological', 'revolutionary', 'sophisticated', 'transformation', 'understanding'],
  10: ['accomplishment', 'breakthroughs', 'comprehensive', 'demonstration', 'entrepreneurship', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdictional', 'laboratories', 'mathematical', 'neighbourhoods', 'organizational', 'philosophical', 'revolutionary', 'sophisticated', 'transformation', 'unprecedented', 'visualization', 'vulnerability', 'accountability', 'biotechnology', 'constitutional', 'discrimination', 'entertainment', 'geographical', 'headquarters', 'institutional', 'justification', 'laboratories', 'manufacturing', 'nevertheless', 'organisation', 'psychological', 'rehabilitation', 'substantially', 'thermodynamics', 'understanding', 'vulnerability', 'accessibility', 'bibliography', 'comprehensive', 'deterioration', 'extraordinary', 'fundamentals', 'globalization', 'humanitarian', 'incorporating', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'philosophical', 'revolutionary', 'sophisticated', 'thermodynamics', 'unconventional', 'visualization', 'accompaniment', 'breakthroughs', 'concentration', 'discrimination', 'entrepreneurship', 'geographical', 'headquarters', 'institutional', 'jurisdiction', 'laboratories', 'mathematical', 'nevertheless', 'organizations', 'philosophical', 'revolutionary', 'substantially', 'transformation', 'unprecedented', 'vulnerability', 'accountability', 'breakthroughs', 'comprehensive', 'deterioration', 'entrepreneurs', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'psychological', 'revolutionary', 'sophisticated', 'transformation', 'understanding'],
  11: ['sophistication', 'revolutionary', 'transformation', 'unprecedented', 'entrepreneurial', 'philanthropic', 'comprehensive', 'demonstration', 'extraordinary', 'infrastructure', 'jurisdictional', 'mathematical', 'organizational', 'psychological', 'rehabilitation', 'substantially', 'thermodynamics', 'understanding', 'visualization', 'vulnerability', 'accountability', 'biotechnology', 'constitutional', 'discrimination', 'entertainment', 'geographical', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'manufacturing', 'nevertheless', 'organisation', 'philosophical', 'revolutionary', 'sophisticated', 'transformation', 'unprecedented', 'vulnerability', 'accessibility', 'bibliography', 'comprehensive', 'deterioration', 'entrepreneurship', 'fundamentally', 'globalization', 'humanitarian', 'incorporating', 'jurisdictions', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'philosophical', 'revolutionary', 'substantially', 'thermodynamics', 'unconventional', 'visualization', 'accompaniment', 'breakthroughs', 'concentration', 'discrimination', 'entrepreneurship', 'geographical', 'headquarters', 'institutional', 'jurisdiction', 'laboratories', 'mathematical', 'nevertheless', 'organizations', 'philosophical', 'revolutionary', 'substantially', 'transformation', 'unprecedented', 'vulnerability', 'accountability', 'breakthroughs', 'comprehensive', 'deterioration', 'entrepreneurs', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'psychological', 'revolutionary', 'sophisticated', 'transformation', 'understanding'],
  12: ['unprecedented', 'sophistication', 'entrepreneurial', 'philanthropic', 'jurisdictional', 'comprehensive', 'extraordinary', 'infrastructure', 'mathematical', 'organizational', 'psychological', 'rehabilitation', 'substantially', 'thermodynamics', 'understanding', 'visualization', 'vulnerability', 'accountability', 'biotechnology', 'constitutional', 'discrimination', 'entertainment', 'geographical', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'manufacturing', 'nevertheless', 'organisation', 'philosophical', 'revolutionary', 'sophisticated', 'transformation', 'unprecedented', 'vulnerability', 'accessibility', 'bibliography', 'comprehensive', 'deterioration', 'entrepreneurship', 'fundamentally', 'globalization', 'humanitarian', 'incorporating', 'jurisdictions', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'philosophical', 'revolutionary', 'substantially', 'thermodynamics', 'unconventional', 'visualization', 'accompaniment', 'breakthroughs', 'concentration', 'discrimination', 'entrepreneurship', 'geographical', 'headquarters', 'institutional', 'jurisdiction', 'laboratories', 'mathematical', 'nevertheless', 'organizations', 'philosophical', 'revolutionary', 'substantially', 'transformation', 'unprecedented', 'vulnerability', 'accountability', 'breakthroughs', 'comprehensive', 'deterioration', 'entrepreneurs', 'fundamentally', 'governmental', 'humanitarian', 'incorporation', 'jurisdiction', 'laboratories', 'mathematical', 'neighbourhood', 'organisational', 'psychological', 'revolutionary', 'sophisticated', 'transformation', 'understanding'],
};

// Sentence templates for generating questions
const TEMPLATES = [
  { en: 'The ___ was very useful.', zh: '___ 非常有用。' },
  { en: 'I need to ___ this problem.', zh: '我需要 ___ 这个问题。' },
  { en: 'She showed great ___.', zh: '她展现了极大的 ___。' },
  { en: 'The ___ of the project was successful.', zh: '这个项目的 ___ 很成功。' },
  { en: 'We should ___ the situation carefully.', zh: '我们应该仔细 ___ 情况。' },
  { en: 'His ___ impressed everyone.', zh: '他的 ___ 给每个人留下了深刻印象。' },
  { en: 'They decided to ___ the plan.', zh: '他们决定 ___ 这个计划。' },
  { en: 'The ___ is an important concept.', zh: '___ 是一个重要的概念。' },
  { en: 'I have a strong ___ about this.', zh: '我对此有强烈的 ___。' },
  { en: 'We must ___ our goals.', zh: '我们必须 ___ 我们的目标。' },
  { en: 'The ___ made a big difference.', zh: '___ 带来了巨大的改变。' },
  { en: 'Can you ___ what happened?', zh: '你能 ___ 发生了什么吗？' },
  { en: 'The ___ was carefully planned.', zh: '___ 被精心策划。' },
  { en: 'She has excellent ___ skills.', zh: '她有出色的 ___ 能力。' },
  { en: 'We need to ___ more research.', zh: '我们需要 ___ 更多研究。' },
  { en: 'The ___ of the matter is complex.', zh: '这件事的 ___ 很复杂。' },
  { en: 'He tried to ___ the situation.', zh: '他试图 ___ 这种情况。' },
  { en: 'This ___ requires attention.', zh: '这个 ___ 需要注意。' },
  { en: 'They ___ the importance of education.', zh: '他们 ___ 了教育的重要性。' },
  { en: 'The ___ was truly remarkable.', zh: '___ 真的非常了不起。' },
];

function generateQuestion(word: string, grade: number, difficulty: string): SeedQuestion {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return {
    sentenceEn: template.en.replace('___', '___'),
    sentenceZh: template.zh.replace('___', word),
    targetWord: word,
    firstLetter: word[0],
    grade,
    difficulty,
    funFacts: getRandomFacts(),
  };
}

// Assign difficulty based on word length
function getDifficulty(word: string): string {
  if (word.length <= 5) return 'easy';
  if (word.length <= 8) return 'medium';
  return 'hard';
}

async function main() {
  console.log('? Starting seed with comprehensive question bank...');

  // Clear existing questions
  await prisma.answerRecord.deleteMany();
  await prisma.wrongBook.deleteMany();
  await prisma.question.deleteMany();
  console.log('  Cleared existing questions');

  let allQuestions: SeedQuestion[] = [...GRADE_1_EASY];

  // Generate questions for grades 2-12
  for (let grade = 2; grade <= 12; grade++) {
    const words = GRADE_VOCAB[grade] || [];
    for (const word of words) {
      allQuestions.push(generateQuestion(word, grade, getDifficulty(word)));
    }
  }

  console.log(`  Generated ${allQuestions.length} total questions`);

  // Insert in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const batch = allQuestions.slice(i, i + BATCH_SIZE);
    await prisma.question.createMany({
      data: batch.map((q) => ({
        sentenceEn: q.sentenceEn,
        sentenceZh: q.sentenceZh,
        targetWord: q.targetWord,
        firstLetter: q.firstLetter,
        blankCount: q.targetWord.length,
        grade: q.grade,
        difficulty: q.difficulty,
        questionType: 'first_letter',
        bpm: 80 + Math.floor(Math.random() * 30),
        reviewStatus: 'approved',
        funFacts: JSON.stringify(q.funFacts),
      })),
    });
    console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allQuestions.length / BATCH_SIZE)}`);
  }

  // Verify
  const count = await prisma.question.count();
  console.log(`? Seed complete! Total questions: ${count}`);

  // Stats per grade
  const stats = await prisma.question.groupBy({
    by: ['grade'],
    _count: { id: true },
    orderBy: { grade: 'asc' },
  });

  console.log('\n? Questions per grade:');
  for (const s of stats) {
    console.log(`  Grade ${s.grade}: ${s._count.id} questions`);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
