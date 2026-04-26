from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import random
from utils.preprocessing import preprocess_text, fix_typos, get_keywords
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
with open('models/chatbot_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Load tag mappings
with open('models/tag_mappings.pkl', 'rb') as f:
    mappings = pickle.load(f)

index_to_tag = mappings['index_to_tag']
intents = mappings['intents']

# ---------------------------------------------------------------------------
# FPS Data Table
# Format: fps_data[cpu][gpu][resolution] = fps (int)
# ---------------------------------------------------------------------------
fps_data = {
    "i5-13600K": {
        "rtx-4060": {
            "1920x1080": 144,
            "2560x1440": 110,
            "3840x2160": 60,
        },
        "rtx-4070": {
            "1920x1080": 180,
            "2560x1440": 144,
            "3840x2160": 85,
        },
        "rtx-4090": {
            "1920x1080": 220,
            "2560x1440": 190,
            "3840x2160": 120,
        },
    },
    "i7-13700K": {
        "rtx-4060": {
            "1920x1080": 155,
            "2560x1440": 118,
            "3840x2160": 65,
        },
        "rtx-4070": {
            "1920x1080": 195,
            "2560x1440": 158,
            "3840x2160": 95,
        },
        "rtx-4090": {
            "1920x1080": 240,
            "2560x1440": 210,
            "3840x2160": 135,
        },
    },
    "ryzen-7-7800X3D": {
        "rtx-4060": {
            "1920x1080": 160,
            "2560x1440": 122,
            "3840x2160": 68,
        },
        "rtx-4070": {
            "1920x1080": 205,
            "2560x1440": 165,
            "3840x2160": 100,
        },
        "rtx-4090": {
            "1920x1080": 260,
            "2560x1440": 225,
            "3840x2160": 145,
        },
    },
}

# ---------------------------------------------------------------------------
# Game multipliers — applied on top of the base FPS
# ---------------------------------------------------------------------------
game_multipliers = {
    # Easy to run (high FPS)
    "valorant":         2.2,
    "cs2":              1.8,
    "csgo":             1.8,
    "counter-strike":   1.8,
    "minecraft":        1.5,
    "fortnite":         1.2,
    "apex":             1.1,
    "apex legends":     1.1,
    "rocket league":    1.6,
    "league of legends":1.9,
    "lol":              1.9,
    "overwatch":        1.3,
    "overwatch 2":      1.3,

    # Mid-tier
    "gta 5":            0.95,
    "gta v":            0.95,
    "elden ring":       0.85,
    "cyberpunk":        0.60,
    "cyberpunk 2077":   0.60,
    "red dead":         0.70,
    "rdr2":             0.70,
    "hogwarts legacy":  0.75,
    "the witcher 3":    0.90,
    "cod":              0.95,
    "call of duty":     0.95,
    "warzone":          0.90,

    # Demanding
    "alan wake 2":      0.55,
    "starfield":        0.65,
    "black myth":       0.60,
    "black myth wukong":0.60,
    "avatar":           0.50,
    "the last of us":   0.65,
}

# ---------------------------------------------------------------------------
# Friendly display names for specs
# ---------------------------------------------------------------------------
cpu_display = {
    "i5-13600K":        "Intel i5-13600K",
    "i7-13700K":        "Intel i7-13700K",
    "ryzen-7-7800X3D":  "AMD Ryzen 7 7800X3D",
}

gpu_display = {
    "rtx-4060": "NVIDIA RTX 4060 Ti",
    "rtx-4070": "NVIDIA RTX 4070",
    "rtx-4090": "NVIDIA RTX 4090",
}

resolution_display = {
    "1920x1080": "1080p",
    "2560x1440": "1440p",
    "3840x2160": "4K",
}

# ---------------------------------------------------------------------------
# FPS rating helper
# ---------------------------------------------------------------------------
def fps_rating(fps: int) -> str:
    if fps >= 200:
        return "🟢 Exceptional"
    elif fps >= 144:
        return "🟢 Excellent"
    elif fps >= 100:
        return "🟡 Great"
    elif fps >= 60:
        return "🟡 Smooth"
    elif fps >= 30:
        return "🟠 Playable"
    else:
        return "🔴 Poor"

# ---------------------------------------------------------------------------
# Detect if the user is asking about a specific game
# ---------------------------------------------------------------------------
def detect_game(text: str):
    text_lower = text.lower()
    for game in game_multipliers:
        if game in text_lower:
            return game
    return None

# ---------------------------------------------------------------------------
# Build FPS response
# ---------------------------------------------------------------------------
def build_fps_response(game: str, specs: dict) -> str:
    cpu = specs.get("cpu", "")
    gpu = specs.get("gpu", "")
    resolution = specs.get("resolution", "")

    # Validate specs exist in our table
    if cpu not in fps_data or gpu not in fps_data[cpu] or resolution not in fps_data[cpu][gpu]:
        return (
            "I couldn't find FPS data for your exact specs. "
            "Please make sure you selected your CPU, GPU, and resolution on the previous page."
        )

    base_fps = fps_data[cpu][gpu][resolution]
    multiplier = game_multipliers.get(game, 1.0)
    estimated_fps = int(base_fps * multiplier)
    rating = fps_rating(estimated_fps)

    cpu_name = cpu_display.get(cpu, cpu)
    gpu_name = gpu_display.get(gpu, gpu)
    res_name = resolution_display.get(resolution, resolution)
    game_title = game.title()

    return (
        f"🎮 FPS Estimate for {game_title}\n\n"
        f"• CPU: {cpu_name}\n"
        f"• GPU: {gpu_name}\n"
        f"• Resolution: {res_name}\n\n"
        f"Estimated FPS: ~{estimated_fps} FPS\n"
        f"Performance Rating: {rating}\n\n"
        f"{'This is well above 60 FPS — enjoy buttery smooth gameplay!' if estimated_fps >= 60 else 'You may want to lower settings for a smoother experience.'}"
    )

# ---------------------------------------------------------------------------
# Build an upgrade suggestion response
# ---------------------------------------------------------------------------
def build_upgrade_response(specs: dict) -> str:
    cpu = specs.get("cpu", "")
    gpu = specs.get("gpu", "")
    resolution = specs.get("resolution", "")

    cpu_name = cpu_display.get(cpu, cpu)
    gpu_name = gpu_display.get(gpu, gpu)
    res_name = resolution_display.get(resolution, resolution)

    suggestions = []

    if gpu == "rtx-4060":
        suggestions.append("• Upgrading to the RTX 4070 would give you ~25% more FPS.")
    elif gpu == "rtx-4070":
        suggestions.append("• Upgrading to the RTX 4090 would give you ~30% more FPS for demanding titles.")

    if resolution == "3840x2160":
        suggestions.append("• Dropping to 1440p would significantly boost FPS without losing much visual quality.")
    elif resolution == "2560x1440":
        suggestions.append("• If FPS is your priority, 1080p still offers the highest frame rates.")

    if not suggestions:
        suggestions.append("• Your current setup is already top-tier! No upgrades needed.")

    return (
        f"💡 Upgrade Recommendations for your setup:\n\n"
        f"Current: {cpu_name} | {gpu_name} | {res_name}\n\n"
        + "\n".join(suggestions)
    )

# ---------------------------------------------------------------------------
# Main response function
# ---------------------------------------------------------------------------
def get_response(user_input: str, specs: dict | None) -> str:
    # Fix typos and preprocess
    fixed_input = fix_typos(user_input)
    processed_input = preprocess_text(fixed_input)

    if not processed_input:
        return "I didn't quite understand that. Could you rephrase?"

    # --- FPS / game query: check for a specific game first ---
    game = detect_game(fixed_input)
    if game and specs:
        return build_fps_response(game, specs)

    # --- Predict intent via ML model ---
    try:
        prediction = model.predict([processed_input])[0]
        confidence = max(model.predict_proba([processed_input])[0])
        tag = index_to_tag.get(prediction, "unknown")
    except Exception:
        return "Sorry, I encountered an error. Please try again."

    # --- Handle intents that benefit from specs context ---
    if specs:
        if tag == "fps_query":
            return (
                "Sure! I can estimate FPS for your setup:\n"
                f"• CPU: {cpu_display.get(specs.get('cpu',''), specs.get('cpu',''))}\n"
                f"• GPU: {gpu_display.get(specs.get('gpu',''), specs.get('gpu',''))}\n"
                f"• Resolution: {resolution_display.get(specs.get('resolution',''), specs.get('resolution',''))}\n\n"
                "Just tell me the game you want to check!"
            )

        if tag == "upgrade_question":
            return build_upgrade_response(specs)

        if tag == "game_recommendations":
            cpu = specs.get("cpu", "")
            gpu = specs.get("gpu", "")
            resolution = specs.get("resolution", "")
            base_fps = fps_data.get(cpu, {}).get(gpu, {}).get(resolution, 0)

            if base_fps == 0:
                return "Tell me a specific game and I'll check if you can run it!"

            playable = [
                g.title() for g, m in game_multipliers.items()
                if int(base_fps * m) >= 60
            ]
            demanding = [
                g.title() for g, m in game_multipliers.items()
                if int(base_fps * m) < 60
            ]

            resp = f"Based on your specs, here's what you can run at {resolution_display.get(resolution, resolution)}:\n\n"
            if playable:
                resp += f"✅ Runs well (60+ FPS): {', '.join(playable[:6])}\n"
            if demanding:
                resp += f"⚠️ May struggle (<60 FPS): {', '.join(demanding[:4])}\n"
            resp += "\nAsk me about a specific game for a detailed FPS estimate!"
            return resp

    # --- Fall back to standard intent responses ---
    for intent in intents:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])

    return "I'm not sure about that. Could you tell me more?"

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        specs = data.get('specs', None)  # { cpu, gpu, resolution }

        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        response = get_response(user_message, specs)

        return jsonify({
            'user_message': user_message,
            'bot_response': response,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Server is running'})


if __name__ == '__main__':
    os.makedirs('models', exist_ok=True)
    app.run(debug=True, port=5000)