const detectEmotionPredefined = (text: string): string => {
  const rules = [
    { emotion: 'joy', keywords: ['うれし', '嬉',  '楽し', '最高', 'できた'] },
    { emotion: 'anger', keywords: ['怒', 'むかつく', 'イライラ'] },
    { emotion: 'sadness', keywords: ['悲', '泣', 'つらい'] },
    // { emotion: 'surprise', keywords: ['びっくり', '驚'] },
    // { emotion: 'fear', keywords: ['怖い', '恐'] }
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) return rule.emotion;
    }
  }
  return 'neutral';
}

const emotionToImage = (emotion: string): string => {
  return `/img/${emotion}.png`;
};
export { detectEmotionPredefined, emotionToImage }; 