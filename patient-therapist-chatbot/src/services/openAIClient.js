export async function extractKeywords(problemDescription) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Extract therapy-relevant keywords from the following patient problem description. Return a comma-separated list."
          },
          {
            role: "user",
            content: problemDescription
          }
        ],
      }),
    });
  
    const result = await response.json();
    const keywords = result.choices[0].message.content.split(',').map(k => k.trim());
    return keywords;
  }
  