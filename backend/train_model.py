import json
import pickle
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np
from utils.preprocessing import preprocess_text, fix_typos

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Load intents
with open('datasets/intents.json', 'r') as f:
    intents_data = json.load(f)

intents = intents_data['intents']

# Prepare training data
training_data = []
labels = []
tag_to_index = {}
index_to_tag = {}

for idx, intent in enumerate(intents):
    tag = intent['tag']
    tag_to_index[tag] = idx
    index_to_tag[idx] = tag
    
    for pattern in intent['patterns']:
        # Preprocess pattern
        processed = preprocess_text(pattern)
        training_data.append(processed)
        labels.append(idx)

print(f"Training data size: {len(training_data)}")
print(f"Number of intents: {len(intents)}")

# Create and train the model
model = Pipeline([
    ('tfidf', TfidfVectorizer(analyzer='word', lowercase=True, max_features=1000)),
    ('clf', MultinomialNB())
])

model.fit(training_data, labels)

# Save the model
with open('models/chatbot_model.pkl', 'wb') as f:
    pickle.dump(model, f)

# Save tag mappings
with open('models/tag_mappings.pkl', 'wb') as f:
    pickle.dump({
        'tag_to_index': tag_to_index,
        'index_to_tag': index_to_tag,
        'intents': intents
    }, f)

print("Model trained and saved successfully!")