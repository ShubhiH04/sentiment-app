document.getElementById('sentimentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('textInput').value.trim();
  const loadingDiv = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Reset UI
  loadingDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  try {
    const response = await fetch('/api/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze sentiment');
    }

    const data = await response.json();
    displayResults(data);

    loadingDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
  } catch (error) {
    console.error('Error:', error);
    loadingDiv.classList.add('hidden');
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.classList.remove('hidden');
  }
});

function displayResults(data) {
  const sentiment = data.sentiment;
  const scores = data.scores;
  const sentences = data.sentences;

  // Update sentiment badge
  const badge = document.getElementById('sentimentBadge');
  badge.textContent = sentiment;
  badge.className = `sentiment-badge ${sentiment}`;

  // Update score bars and values
  const positivePercent = Math.round(scores.positive * 100);
  const neutralPercent = Math.round(scores.neutral * 100);
  const negativePercent = Math.round(scores.negative * 100);

  document.getElementById('positiveScore').style.width = positivePercent + '%';
  document.getElementById('positiveValue').textContent = positivePercent + '%';

  document.getElementById('neutralScore').style.width = neutralPercent + '%';
  document.getElementById('neutralValue').textContent = neutralPercent + '%';

  document.getElementById('negativeScore').style.width = negativePercent + '%';
  document.getElementById('negativeValue').textContent = negativePercent + '%';

  // Display sentences
  const sentencesList = document.getElementById('sentencesList');
  sentencesList.innerHTML = '';

  if (sentences && sentences.length > 0) {
    sentences.forEach(sentence => {
      const sentenceDiv = document.createElement('div');
      sentenceDiv.className = `sentence-item ${sentence.sentiment}`;

      sentenceDiv.innerHTML = `
        <div class="sentence-text">${escapeHtml(sentence.text)}</div>
        <div class="sentence-sentiment">${sentence.sentiment}</div>
      `;

      sentencesList.appendChild(sentenceDiv);
    });
  } else {
    const sentencesSection = document.getElementById('sentencesSection');
    sentencesSection.style.display = 'none';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
