// review-gemini.mjs
import { GoogleGenAI } from "@google/genai";
import readline from "readline/promises";

// 30가지 감정 키워드
const EMOTION_KEYWORDS = [
  "행복", "슬픔", "분노", "즐거움", "긴장됨", "우울", "무서움", "감동", "경이로움", "아쉬움",
  "희망", "실망", "설렘", "놀라움", "두려움", "그리움", "외로움", "평온함", "짜증", "뿌듯함",
  "피곤함", "지루함", "충격", "혼란", "불안", "만족", "자유로움", "고마움", "원망", "기대"
];
const RECOMMEND_OPTIONS = ["추천함", "추천하지 않음", "다시 보고 싶음"];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getByteLength(str) {
  return Buffer.byteLength(str.replace(/\s/g, ""), "utf8");
}

function makePrompt({ title, emotions, recommend, score }) {
  return (
    `영화 "${title}"에 대한 관람평을 3개 생성해 주세요.\n` +
    `조건:\n` +
    `- 감정 키워드: ${emotions.join(", ")} (최대 10개)\n` +
    `- 추천 여부: ${recommend}\n` +
    `- 평점: ${score}점(1~10점)\n` +
    `- 각 관람평은 영화제목, 감정, 추천, 평점이 자연스럽게 포함되어야 하며, 공백 제외 800바이트 내외로 작성.\n` +
    `- 감정 키워드에는 별표(*)나 굵게(**) 표시를 사용하지 마세요.\n` +
    `- 감정형용사, 부사, 생생한 묘사를 활용해 주세요.\n` +
    `- 출력은 1, 2, 3 순서로 관람평만 출력하세요. 키워드에 별표나 강조 기호를 붙이지 마세요.\n`
  );
}

async function askMovieTitle() {
  const title = await rl.question("좋아요! 먼저 영화제목을 입력해 주세요.\n영화제목: ");
  return title.trim();
}

async function askEmotions() {
  console.log("\n첫 번째 질문입니다.\n아래 30가지 감정 키워드 중에서 최대 10개를 골라주세요.");
  console.log(EMOTION_KEYWORDS.join(", "));
  let selected = [];
  while (true) {
    const input = await rl.question("최대 10개의 감정을 쉼표로 구분해 입력해 주세요: ");
    selected = input.split(",").map(s => s.trim()).filter(Boolean);
    selected = [...new Set(selected)];
    const invalid = selected.filter(e => !EMOTION_KEYWORDS.includes(e));
    if (selected.length === 0) {
      console.log("▶️ 감정 키워드를 한 개 이상 입력해 주세요.");
    } else if (selected.length > 10) {
      console.log("▶️ 감정 키워드는 최대 10개까지 입력할 수 있습니다.");
    } else if (invalid.length > 0) {
      console.log(`▶️ 다음 감정 키워드는 목록에 없습니다: ${invalid.join(", ")}`);
      console.log("아래 표에서 정확히 골라 입력해 주세요.");
      console.log(EMOTION_KEYWORDS.join(", "));
    } else {
      return selected;
    }
  }
}

async function askRecommend() {
  console.log("\n두 번째 질문입니다.\n아래 중에서 추천 여부를 하나 골라 입력해 주세요.");
  console.log(RECOMMEND_OPTIONS.join(", "));
  while (true) {
    const answer = await rl.question("추천 여부: ");
    if (RECOMMEND_OPTIONS.includes(answer.trim())) {
      return answer.trim();
    }
    console.log("▶️ 아래 중 하나를 정확히 입력해 주세요:", RECOMMEND_OPTIONS.join(", "));
  }
}

async function askScore() {
  console.log("\n마지막 질문입니다.\n1점부터 10점까지, 1점 단위로 평점을 입력해 주세요.");
  while (true) {
    const answer = await rl.question("평점 (1~10): ");
    const score = parseInt(answer.trim(), 10);
    if (score >= 1 && score <= 10) return score;
    console.log("▶️ 1~10 사이의 정수를 입력해 주세요.");
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // 단계별 입력
  const title = await askMovieTitle();
  const emotions = await askEmotions();
  const recommend = await askRecommend();
  const score = await askScore();

  const prompt = makePrompt({ title, emotions, recommend, score });

  console.log("\nAI 관람평 생성 중... (Gemini API 호출)\n");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      generationConfig: {
        maxOutputTokens: 2000 // 800바이트 내외(한글/영문 혼합) 충분히 커버
      }
    });

    let text = "";
    if (response && typeof response.text === "string") {
      text = response.text;
    } else if (response && typeof response.text === "function") {
      text = await response.text();
    } else if (response && response.response && typeof response.response.text === "function") {
      text = await response.response.text();
    } else {
      text = JSON.stringify(response);
    }

    // 관람평 3개 추출 및 바이트 길이 체크
    const reviews = text
      .split(/\n\d+\./)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    reviews.forEach((review, i) => {
      const byteLen = getByteLength(review);
      console.log(`\n관람평 ${i + 1} (${byteLen} bytes):\n${review}`);
    });
  } catch (err) {
    console.error("Gemini API 호출 오류:", err.message);
  }
  rl.close();
}

main();
