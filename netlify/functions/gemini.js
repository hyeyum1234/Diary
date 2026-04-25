exports.handler = async function(event) {
  const GEMINI_KEY = process.env.GEMINI_KEY;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const prompt = body.prompt;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );

    const data = await response.json();

    // 응답에서 텍스트만 추출
    var text = "";
    if (data && data.candidates && data.candidates[0]) {
      var parts = data.candidates[0].content.parts;
      parts.forEach(function(p) {
        if (p.text && !p.thought) text += p.text;
      });
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ text: text })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message })
    };
  }
};
