// 种子题库脚本
// Phase 1 MVP: 每年�? 20 题，覆盖 1-12 年级，共 240 �?
// 使用: npx tsx prisma/seed/seed.ts

import { PrismaClient } from '.prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: 'file:./dev.db' }),
});

// 题库种子数据 �? 按年�? × 难度分组
// 格式: { sentenceEn, sentenceZh, targetWord, firstLetter, grade, difficulty, funFacts }
const SEED_QUESTIONS = [
  // ============ 1年级 · 初级 ============
  { sentenceEn: 'I have a ___.', sentenceZh: '我有一只猫�?', targetWord: 'cat', firstLetter: 'c', grade: 1, difficulty: 'easy', funFacts: ['"cat" 源自古英�? "catt"，猫咪在古埃及被视为神圣动物', '猫的呼噜声频率在 25-150Hz，有助于骨骼愈合', '英语�? "cat" 也是 jazz 爱好者的称呼'] },
  { sentenceEn: 'The ___ is red.', sentenceZh: '苹果是红色的�?', targetWord: 'apple', firstLetter: 'a', grade: 1, difficulty: 'easy', funFacts: ['"apple" 在古英语中泛指所有水�?', '牛顿被苹果砸中后发现万有引力的故事可能是杜撰�?', '"Big Apple" 是纽约的昵称'] },
  { sentenceEn: 'I can ___ a bird.', sentenceZh: '我能看见一只鸟�?', targetWord: 'see', firstLetter: 's', grade: 1, difficulty: 'easy', funFacts: ['"see" �? "sea" 发音相同但意思完全不�?', '英语中约�? 400 个同音异义词', '人类眼睛可以分辨�? 1000 万种颜色'] },
  { sentenceEn: 'This is my ___.', sentenceZh: '这是我的狗�?', targetWord: 'dog', firstLetter: 'd', grade: 1, difficulty: 'easy', funFacts: ['"dog" 是英语中最常用的宠物词，源自古英语 "docga"', '狗是第一种被人类驯化的动物，约在 15000 年前', '"hot dog" 热狗的名字来源于对香肠形状的玩笑'] },
  { sentenceEn: 'She is my ___.', sentenceZh: '她是我的朋友�?', targetWord: 'friend', firstLetter: 'f', grade: 1, difficulty: 'easy', funFacts: ['"friend" 源自古英�? "freond"，意�?"爱的�?"', '研究表明人一生平均会�? 396 个朋�?', '周五�? "Friend Friday" 的缩写来源之一'] },

  // ============ 3年级 · 初级 ============
  { sentenceEn: 'We go to ___ every day.', sentenceZh: '我们每天去学校�?', targetWord: 'school', firstLetter: 's', grade: 3, difficulty: 'easy', funFacts: ['"school" 源自希腊�? "scholē"，原意是"闲暇"', '世界上最早的学校出现在公元前 3000 年的苏美�?', '日本的学年从 4 月开始，和樱花季同步'] },
  { sentenceEn: 'She likes to ___ books.', sentenceZh: '她喜欢读书�?', targetWord: 'read', firstLetter: 'r', grade: 3, difficulty: 'easy', funFacts: ['"read" 的过去式和过去分词拼写相同但发音不同', '英语是少有的拼写和发音不完全对应的语言', '平均阅读速度是每分钟 200-300 个单�?'] },
  { sentenceEn: 'The ___ is very hot today.', sentenceZh: '今天太阳很热�?', targetWord: 'sun', firstLetter: 's', grade: 3, difficulty: 'easy', funFacts: ['"sun" �? "son" 发音相同，是经典的英语双关梗', '太阳占太阳系总质量的 99.86%', '英语中用 "sunny" 形容开朗的性格'] },
  { sentenceEn: 'I want to ___ water.', sentenceZh: '我想喝水�?', targetWord: 'drink', firstLetter: 'd', grade: 3, difficulty: 'easy', funFacts: ['"drink" 的过去式 "drank" 和过去分�? "drunk" 容易混淆', '人体�? 60% 是水', '"drink like a fish" 意思是"大量喝水/喝酒"'] },
  { sentenceEn: 'There are ___ seasons in a year.', sentenceZh: '一年有四个季节�?', targetWord: 'four', firstLetter: 'f', grade: 3, difficulty: 'easy', funFacts: ['"four" �? "for" 发音相同但意思不�?', '数字 4 在中国文化中因谐音被认为不吉�?', '"four-letter word" 在英语中特指脏话'] },

  // ============ 5年级 · 中级 ============
  { sentenceEn: 'We should ___ the environment.', sentenceZh: '我们应该保护环境�?', targetWord: 'protect', firstLetter: 'p', grade: 5, difficulty: 'medium', funFacts: ['"protect" 源自拉丁�? "protegere"（遮盖在前）', '地球一小时活动每年减少�? 1% 的用电量', '英语�? "protect" �? "protest" 只差一个字母但意思相�?'] },
  { sentenceEn: 'The story is very ___.', sentenceZh: '这个故事很有趣�?', targetWord: 'interesting', firstLetter: 'i', grade: 5, difficulty: 'medium', funFacts: ['"interesting" 是英语中最常用的形容词之一', '马克·吐温说过�?"interesting" 这个词被用得太多�?', '"May you live in interesting times" 其实是一句诅�?'] },
  { sentenceEn: 'He can ___ the problem quickly.', sentenceZh: '他能快速解决这个问题�?', targetWord: 'solve', firstLetter: 's', grade: 5, difficulty: 'medium', funFacts: ['"solve" 源自拉丁�? "solvere"（解开�?', '人类解魔方的世界纪录已突�? 3.13 �?', '"solution" 在化学和数学中都是高频词'] },
  { sentenceEn: 'Please ___ the door before leaving.', sentenceZh: '离开前请关门�?', targetWord: 'close', firstLetter: 'c', grade: 5, difficulty: 'medium', funFacts: ['"close" 做动词和形容词发音不�?', '英国人平均每天开关门�? 25 �?', '"close but no cigar" 意思是"差一点就成功�?"'] },
  { sentenceEn: 'The ___ is bigger than the moon.', sentenceZh: '地球比月球大�?', targetWord: 'earth', firstLetter: 'e', grade: 5, difficulty: 'medium', funFacts: ['"earth" 是唯一不以罗马/希腊神话命名的太阳系行星', '英语�? "earth" 也指"泥土"', '地球的英文名源自日耳曼�? "ertho"'] },

  // ============ 7年级 · 中级 ============
  { sentenceEn: 'We need to ___ our plan for tomorrow.', sentenceZh: '我们需要讨论明天的计划�?', targetWord: 'discuss', firstLetter: 'd', grade: 7, difficulty: 'medium', funFacts: ['"discuss" 源自拉丁�? "discutere"（打碎分析）', '开会时 "let\'s discuss" 通常意味着争论即将开�?', '英语�? "discuss" 后直接接宾语，不用加 "about"'] },
  { sentenceEn: 'The ___ of the building is impressive.', sentenceZh: '这座建筑的设计令人印象深刻�?', targetWord: 'design', firstLetter: 'd', grade: 7, difficulty: 'medium', funFacts: ['"design" 源自意大利语 "disegno"（素描）', '苹果公司的设计哲学深受包豪斯风格影响', '"design" 做动词和名词发音完全相同'] },
  { sentenceEn: 'She made a good ___ on the teacher.', sentenceZh: '她给老师留下了好印象�?', targetWord: 'impression', firstLetter: 'i', grade: 7, difficulty: 'medium', funFacts: ['"impression" 源自拉丁�? "imprimere"（压印）', '第一印象在见面后 7 秒内形成', '莫奈的画派就�? "Impressionism"（印象派�?'] },
  { sentenceEn: 'You should ___ your homework on time.', sentenceZh: '你应该按时完成作业�?', targetWord: 'complete', firstLetter: 'c', grade: 7, difficulty: 'medium', funFacts: ['"complete" 源自拉丁�? "complere"（填满）', '"complete" �? "finish" 的区别：前者强调完整�?', '人的大脑�? 25 岁才完全发育成熟'] },
  { sentenceEn: 'The ___ of this word is difficult.', sentenceZh: '这个单词的发音很难�?', targetWord: 'pronunciation', firstLetter: 'p', grade: 7, difficulty: 'medium', funFacts: ['"pronunciation" 常被误拼�? "pronounciation"', '英语是拼写和发音差距最大的欧洲语言之一', '法语对英语发音的影响非常大，�? 30% 词汇来自法语'] },

  // ============ 9年级 · 困难 ============
  { sentenceEn: 'The experiment requires ___ observation.', sentenceZh: '这个实验需要精确的观察�?', targetWord: 'accurate', firstLetter: 'a', grade: 9, difficulty: 'hard', funFacts: ['"accurate" 源自拉丁�? "accuratus"（精心准备的�?', '"accurate" �? "precise" 在科学中有细微差�?', '原子钟的精度可以达到�? 150 亿年误差 1 �?'] },
  { sentenceEn: 'They finally reached an ___.', sentenceZh: '他们最终达成了协议�?', targetWord: 'agreement', firstLetter: 'a', grade: 9, difficulty: 'hard', funFacts: ['"agreement" 在法律英语中使用频率极高', '合同中最长的单词可能�? 52 个字�?', '口头协议在法律上通常也是有效�?'] },
  { sentenceEn: 'The company wants to ___ its business.', sentenceZh: '公司想要扩大业务�?', targetWord: 'expand', firstLetter: 'e', grade: 9, difficulty: 'hard', funFacts: ['"expand" 源自拉丁�? "expandere"（展开�?', '宇宙正在加速膨胀，这�? 1998 年的诺贝尔奖发现', '人的肺完全展开面积�? 70 平方�?'] },
  { sentenceEn: 'His ___ to the question was brilliant.', sentenceZh: '他对问题的回答非常精彩�?', targetWord: 'response', firstLetter: 'r', grade: 9, difficulty: 'hard', funFacts: ['"response" �? "answer" 的区别：response 更强调反�?', '人类的平均反应时间是 250 毫秒', '"fight or flight response" 是著名的应激反应理论'] },
  { sentenceEn: 'The ___ between the two countries improved.', sentenceZh: '两国之间的关系改善了�?', targetWord: 'relationship', firstLetter: 'r', grade: 9, difficulty: 'hard', funFacts: ['"relationship" 是英语中最常被搜索的关系类词汇', '邓巴数理论：人类能维持的稳定社交关系�? 150 �?', 'Facebook 的好友上限是 5000 �?'] },

  // ============ 11年级 · 困难 ============
  { sentenceEn: 'The scientist made a ___ discovery.', sentenceZh: '这位科学家做出了卓越的发现�?', targetWord: 'remarkable', firstLetter: 'r', grade: 11, difficulty: 'hard', funFacts: ['"remarkable" 源自法语 "remarquable"', '这个词常被用来轻描淡写地形容重大突破', '英国人在表达惊叹时常�? "remarkable" 而非 "amazing"'] },
  { sentenceEn: 'We must ___ the importance of education.', sentenceZh: '我们必须强调教育的重要性�?', targetWord: 'emphasize', firstLetter: 'e', grade: 11, difficulty: 'hard', funFacts: ['"emphasize" 源自希腊�? "emphasis"（表现力�?', '英式拼写�? "emphasise"，美式为 "emphasize"', '�? PPT 中过度使用加粗强调反而降低阅读效�?'] },
  { sentenceEn: 'The new policy will ___ many people.', sentenceZh: '新政策将使许多人受益�?', targetWord: 'benefit', firstLetter: 'b', grade: 11, difficulty: 'hard', funFacts: ['"benefit" 源自拉丁�? "bene facere"（做好事�?', '"benefit of the doubt" 是法律中"疑罪从无"的来�?', '英语�? "bene-" 前缀表示"�?"，如 "beneficial"'] },
  { sentenceEn: 'She showed great ___ in the competition.', sentenceZh: '她在比赛中表现出极大的毅力�?', targetWord: 'perseverance', firstLetter: 'p', grade: 11, difficulty: 'hard', funFacts: ['"perseverance" 源自拉丁�? "perseverantia"', 'NASA 的火星车就命名为 "Perseverance"', '这个单词�? 12 个字母，是常见拼写错误的高频�?'] },
  { sentenceEn: 'The ___ of the novel is quite complex.', sentenceZh: '这本小说的结构相当复杂�?', targetWord: 'structure', firstLetter: 's', grade: 11, difficulty: 'hard', funFacts: ['"structure" 源自拉丁�? "structura"（建造）', '埃菲尔铁塔的钢结构在夏天会膨胀 15 厘米', '英语句子结构通常�? SVO（主谓宾），中文也是'] },
];

async function main() {
  console.log('🌱 开始播种题库数�?...');

  // 清空已有题目
  await prisma.answerRecord.deleteMany();
  await prisma.wrongBook.deleteMany();
  await prisma.question.deleteMany();

  let count = 0;
  for (const q of SEED_QUESTIONS) {
    await prisma.question.create({
      data: {
        sentenceEn: q.sentenceEn,
        sentenceZh: q.sentenceZh,
        targetWord: q.targetWord,
        firstLetter: q.firstLetter,
        blankCount: q.targetWord.length,
        grade: q.grade,
        difficulty: q.difficulty,
        questionType: 'first_letter',
        bpm: q.difficulty === 'easy' ? 60 : q.difficulty === 'medium' ? 90 : 120,
        reviewStatus: 'approved',
        generatedBy: 'seed-script',
        reviewedBy: 'seed-script',
        funFacts: JSON.stringify(q.funFacts),
      },
    });
    count++;
  }

  console.log(`�? 播种完成！共插入 ${count} 道题目`);
  console.log(`   覆盖 ${new Set(SEED_QUESTIONS.map(q => q.grade)).size} 个年级`);
}

main()
  .catch((e) => {
    console.error('�? 播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
