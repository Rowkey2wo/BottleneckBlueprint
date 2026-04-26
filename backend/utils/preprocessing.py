import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()

def fix_typos(text):
    """Fix common typos, leetspeak, and game name misspellings"""

    # --- General leetspeak / typo fixes ---
    general_fixes = {
        r'h3llo|h1|h11o|hii+':          'hello',
        r'h[0e1]w':                      'how',
        r'wh4t|wut|wh[0o1]t':           'what',
        r'g00d|g0od':                    'good',
        r'f[0o1]r\b':                    'for',
        r'\by0u\b|\bu\b':               'you',
        r'r34lly|r34ly':                'really',
        r'th4nk|thx|thnx|thks':        'thanks',
        r'upGr4de|upgr4de':             'upgrade',
        r'\bc0u\b':                      'cpu',
        r'gr4phics':                    'graphics',
        r'r3solution':                  'resolution',
        r'h31p|h3lp':                   'help',
        r'\bshud\b':                    'should',
        r'fr4mes':                      'frames',
        r'f1ps|fp5':                    'fps',
        r'\bgbye\b':                    'goodbye',
        r'\bbye2\b':                    'bye',
        r'c4n':                         'can',
        r'pl4y|pl@y':                   'play',
        r'g4me|g@me':                   'game',
        r'sp3cs|sp3c':                  'specs',
        r'runn1ng|runn!ng':             'running',
        r'r3s':                         'res',
        r'fr4me':                       'frame',
        r'p3rform':                     'perform',
        r'gr4phic':                     'graphic',
        r'upgr4d':                      'upgrad',
    }

    # --- Game name fixes (leetspeak + common misspellings) ---
    game_fixes = {
        # Valorant
        r'v[a4]l[o0]r[a4]nt|val0rant|v4lorant|val0r4nt|valo rant|valrant|valornat|valoraant': 'valorant',

        # CS2 / CSGO
        r'c[s5]2|c[s5][- ]?g[o0]|counter\s*str[i1]ke\s*2?|cstrike|c\.s\.': 'cs2',

        # Fortnite
        r'f[o0]rtn[i1]te|f0rtn1te|fort\s*nite|fortnit|fortnght': 'fortnite',

        # Apex Legends
        r'[a4]p[e3]x\s*l[e3]g[e3]nds|[a4]p[e3]x|ap3x|4pex': 'apex legends',

        # Minecraft
        r'm[i1]n[e3]cr[a4]ft|m1necraft|minecr4ft|mine\s*craft|minecrft': 'minecraft',

        # GTA 5 / GTA V
        r'gt[a4]\s*[5v]|gt45|g\.t\.a\.?\s*[5v]?|grand\s*theft\s*[a4]uto\s*[5v]?': 'gta 5',

        # Cyberpunk 2077
        r'cyb[e3]rpunk\s*2?0?7?7?|c7b3rpunk|cyb3rpunk|cyberpnk': 'cyberpunk 2077',

        # Elden Ring
        r'[e3]ld[e3]n\s*r[i1]ng|3lden ring|elden r1ng|eldenring': 'elden ring',

        # Red Dead Redemption 2
        r'r[e3]d\s*d[e3][a4]d\s*r[e3]d[e3]mpt[i1][o0]n\s*2?|rdr\s*2?|r\.d\.r\.?\s*2?': 'rdr2',

        # Call of Duty / Warzone
        r'c[a4]ll\s*[o0]f\s*d[u]ty|c\.o\.d\.?|c0d|warzon[e3]|w4rzone': 'warzone',

        # Overwatch
        r'[o0]v[e3]rw[a4]tch\s*2?|0verwatch|overw4tch': 'overwatch 2',

        # Rocket League
        r'r[o0]ck[e3]t\s*l[e3][a4]gu[e3]|r0cket league|rocket le4gue|rl\b': 'rocket league',

        # League of Legends
        r'l[e3][a4]gu[e3]\s*[o0]f\s*l[e3]g[e3]nds|l\.o\.l\.?|\blol\b|leagueoflegends': 'league of legends',

        # Hogwarts Legacy
        r'h[o0]gw[a4]rts\s*l[e3]g[a4]cy|hogw4rts|h0gwarts': 'hogwarts legacy',

        # The Witcher 3
        r'w[i1]tch[e3]r\s*3?|w1tcher|witcher3': 'the witcher 3',

        # Starfield
        r'st[a4]rf[i1][e3]ld|st4rfield|starfi3ld': 'starfield',

        # Alan Wake 2
        r'[a4]l[a4]n\s*w[a4]k[e3]\s*2?|alan w4ke|4lan wake': 'alan wake 2',

        # Black Myth: Wukong
        r'bl[a4]ck\s*myth|wuk[o0]ng|bl4ck myth|blackmyth': 'black myth wukong',

        # Avatar
        r'[a4]v[a4]t[a4]r|4vatar|av4tar': 'avatar',

        # The Last of Us
        r'l[a4]st\s*[o0]f\s*us|tlou|l4st of us|last 0f us': 'the last of us',
    }

    result = text.lower()

    # Apply game fixes first (more specific)
    for pattern, replacement in game_fixes.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # Then apply general fixes
    for pattern, replacement in general_fixes.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    return result


def preprocess_text(text):
    """Clean and preprocess text"""
    text = fix_typos(text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text.lower())
    stop_words = set(stopwords.words('english'))
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return ' '.join(tokens)


def get_keywords(text):
    """Extract keywords from text"""
    text = fix_typos(text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text.lower())
    stop_words = set(stopwords.words('english'))
    keywords = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return keywords