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

# FPS Data Table
fps_data = {
    "i3-12100": {
        "gtx-1050":  {"1920x1080": 45,  "2560x1440": 28,  "3840x2160": 15},
        "gtx-1650":  {"1920x1080": 75,  "2560x1440": 50,  "3840x2160": 25},
        "rtx-3050":  {"1920x1080": 100, "2560x1440": 72,  "3840x2160": 38},
        "rtx-4060":  {"1920x1080": 130, "2560x1440": 95,  "3840x2160": 50},
        "rtx-4070":  {"1920x1080": 155, "2560x1440": 120, "3840x2160": 68},
        "rtx-4090":  {"1920x1080": 185, "2560x1440": 155, "3840x2160": 95},
    },
    "i5-13600K": {
        "gtx-1050":  {"1920x1080": 50,  "2560x1440": 32,  "3840x2160": 18},
        "gtx-1650":  {"1920x1080": 82,  "2560x1440": 56,  "3840x2160": 28},
        "rtx-3050":  {"1920x1080": 108, "2560x1440": 78,  "3840x2160": 42},
        "rtx-4060":  {"1920x1080": 144, "2560x1440": 110, "3840x2160": 60},
        "rtx-4070":  {"1920x1080": 180, "2560x1440": 144, "3840x2160": 85},
        "rtx-4090":  {"1920x1080": 220, "2560x1440": 190, "3840x2160": 120},
    },
    "i7-13700K": {
        "gtx-1050":  {"1920x1080": 52,  "2560x1440": 34,  "3840x2160": 19},
        "gtx-1650":  {"1920x1080": 85,  "2560x1440": 58,  "3840x2160": 30},
        "rtx-3050":  {"1920x1080": 112, "2560x1440": 82,  "3840x2160": 44},
        "rtx-4060":  {"1920x1080": 155, "2560x1440": 118, "3840x2160": 65},
        "rtx-4070":  {"1920x1080": 195, "2560x1440": 158, "3840x2160": 95},
        "rtx-4090":  {"1920x1080": 240, "2560x1440": 210, "3840x2160": 135},
    },
    "ryzen-7-7800X3D": {
        "gtx-1050":  {"1920x1080": 54,  "2560x1440": 35,  "3840x2160": 20},
        "gtx-1650":  {"1920x1080": 88,  "2560x1440": 60,  "3840x2160": 32},
        "rtx-3050":  {"1920x1080": 115, "2560x1440": 85,  "3840x2160": 46},
        "rtx-4060":  {"1920x1080": 160, "2560x1440": 122, "3840x2160": 68},
        "rtx-4070":  {"1920x1080": 205, "2560x1440": 165, "3840x2160": 100},
        "rtx-4090":  {"1920x1080": 260, "2560x1440": 225, "3840x2160": 145},
    },
}

# Available options lists (shown to user when changing specs)
cpu_options = {
    "1": "i3-12100",
    "2": "i5-13600K",
    "3": "i7-13700K",
    "4": "ryzen-7-7800X3D",
}

gpu_options = {
    "1": "gtx-1050",
    "2": "gtx-1650",
    "3": "rtx-3050",
    "4": "rtx-4060",
    "5": "rtx-4070",
    "6": "rtx-4090",
}

resolution_options = {
    "1": "1920x1080",
    "2": "2560x1440",
    "3": "3840x2160",
}

# Game multipliers
game_multipliers = {
    "valorant":          2.2,
    "cs2":               1.8,
    "csgo":              1.8,
    "counter-strike":    1.8,
    "minecraft":         1.5,
    "fortnite":          1.2,
    "apex":              1.1,
    "apex legends":      1.1,
    "rocket league":     1.6,
    "league of legends": 1.9,
    "lol":               1.9,
    "overwatch":         1.3,
    "overwatch 2":       1.3,
    "gta 5":             0.95,
    "gta v":             0.95,
    "elden ring":        0.85,
    "cyberpunk":         0.60,
    "cyberpunk 2077":    0.60,
    "red dead":          0.70,
    "rdr2":              0.70,
    "hogwarts legacy":   0.75,
    "the witcher 3":     0.90,
    "cod":               0.95,
    "call of duty":      0.95,
    "warzone":           0.90,
    "alan wake 2":       0.55,
    "starfield":         0.65,
    "black myth":        0.60,
    "black myth wukong": 0.60,
    "avatar":            0.50,
    "the last of us":    0.65,
}

# Friendly display names
cpu_display = {
    "i3-12100":        "Intel i3-12100",
    "i5-13600K":       "Intel i5-13600K",
    "i7-13700K":       "Intel i7-13700K",
    "ryzen-7-7800X3D": "AMD Ryzen 7 7800X3D",
}

gpu_display = {
    "gtx-1050": "NVIDIA GTX 1050",
    "gtx-1650": "NVIDIA GTX 1650",
    "rtx-3050": "NVIDIA RTX 3050",
    "rtx-4060": "NVIDIA RTX 4060 Ti",
    "rtx-4070": "NVIDIA RTX 4070",
    "rtx-4090": "NVIDIA RTX 4090",
}

resolution_display = {
    "1920x1080": "1080p (1920x1080)",
    "2560x1440": "1440p (2560x1440)",
    "3840x2160": "4K (3840x2160)",
}

# FPS rating helper
def fps_rating(fps: int) -> str:
    if fps >= 200: return "🟢 Exceptional"
    if fps >= 144: return "🟢 Excellent"
    if fps >= 100: return "🟡 Great"
    if fps >= 60:  return "🟡 Smooth"
    if fps >= 30:  return "🟠 Playable"
    return "🔴 Poor"

# Detect known game
def detect_game(text: str):
    text_lower = text.lower()
    for game in sorted(game_multipliers.keys(), key=len, reverse=True):
        if game in text_lower:
            return game
    return None

# Detect if user wants to change specs
def detect_change_request(text: str) -> bool:
    keywords = [
        "change", "switch", "update", "different", "modify",
        "edit", "swap", "use different", "change my", "new specs",
        "change specs", "different specs", "change cpu", "change gpu",
        "change resolution", "different gpu", "different cpu",
        "different resolution", "want to change", "i want to switch"
    ]
    text_lower = text.lower()
    return any(k in text_lower for k in keywords)

# Detect which specific spec category user wants to change
def detect_spec_category(text: str):
    text_lower = text.lower()
    if any(k in text_lower for k in ["cpu", "processor", "intel", "amd", "ryzen"]):
        return "cpu"
    if any(k in text_lower for k in ["gpu", "graphics", "nvidia", "rtx", "card"]):
        return "gpu"
    if any(k in text_lower for k in ["resolution", "res", "1080", "1440", "4k", "2160", "2560"]):
        return "resolution"
    return None

# Detect if user is picking a numbered option (1, 2, 3)
def detect_option_pick(text: str):
    text_stripped = text.strip()
    if text_stripped in ["1", "2", "3", "4", "5", "6"]:
        return text_stripped
    if text_stripped in ["first", "one"]:  return "1"
    if text_stripped in ["second", "two"]: return "2"
    if text_stripped in ["third", "three"]: return "3"
    return None

# Option list messages
def cpu_options_message() -> str:
    return (
        "Which CPU would you like to switch to?\n\n"
        "1️⃣  Intel i3-12100\n"
        "2️⃣  Intel i5-13600K\n"
        "3️⃣  Intel i7-13700K\n"
        "4️⃣  AMD Ryzen 7 7800X3D\n\n"
        "Reply with 1–4!"
    )

def gpu_options_message() -> str:
    return (
        "Which GPU would you like to switch to?\n\n"
        "1️⃣  NVIDIA GTX 1050\n"
        "2️⃣  NVIDIA GTX 1650\n"
        "3️⃣  NVIDIA RTX 3050\n"
        "4️⃣  NVIDIA RTX 4060 Ti\n"
        "5️⃣  NVIDIA RTX 4070\n"
        "6️⃣  NVIDIA RTX 4090\n\n"
        "Reply with 1–6!"
    )

def resolution_options_message() -> str:
    return (
        "Which resolution would you like to switch to?\n\n"
        "1️⃣  1080p (1920x1080)\n"
        "2️⃣  1440p (2560x1440)\n"
        "3️⃣  4K (3840x2160)\n\n"
        "Reply with 1, 2, or 3!"
    )

def ask_which_spec_message() -> str:
    return (
        "Sure! Which spec would you like to change?\n\n"
        "🖥️  CPU (Processor)\n"
        "🎮  GPU (Graphics Card)\n"
        "📺  Resolution\n\n"
        "Just type which one!"
    )

# Unknown input response
def unknown_input_response() -> str:
    return (
        "Hmm, I'm not sure I understood that. 🤔\n\n"
        "Here's what I can help you with:\n"
        "🎮 FPS estimates — just type a game name!\n"
        "🖥️  PC specs info — ask about CPU, GPU, or Resolution\n"
        "⚡ Upgrade advice — ask 'should I upgrade?'\n"
        "🔧 Performance tips — ask 'how to boost FPS?'\n"
        "🍾 Bottleneck info — ask 'what is bottleneck?'\n\n"
        "Or try asking about a specific game like 'Valorant' or 'Cyberpunk 2077'!"
    )

# Build FPS response
def build_fps_response(game: str, specs: dict) -> str:
    cpu = specs.get("cpu", "")
    gpu = specs.get("gpu", "")
    resolution = specs.get("resolution", "")

    if cpu not in fps_data or gpu not in fps_data[cpu] or resolution not in fps_data[cpu][gpu]:
        return (
            "I couldn't find FPS data for your exact specs. "
            "Please make sure you selected your CPU, GPU, and resolution."
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
        f"{'✅ This is well above 60 FPS — enjoy buttery smooth gameplay!' if estimated_fps >= 60 else '⚠️ You may want to lower settings for a smoother experience.'}"
    )

# Unknown game response
def unknown_game_response() -> str:
    return (
        "Sorry, I don't have FPS data for that game yet! 😅\n\n"
        "Games I currently support:\n"
        "🎮 Valorant, CS2, Fortnite, Apex Legends, Minecraft,\n"
        "Rocket League, League of Legends, Overwatch 2,\n"
        "GTA 5, Elden Ring, Cyberpunk 2077, Warzone,\n"
        "Red Dead Redemption 2, Hogwarts Legacy, The Witcher 3,\n"
        "Starfield, Alan Wake 2, Black Myth Wukong, The Last of Us\n\n"
        "Try asking about one of these! 👆"
    )

# Build upgrade response
def build_upgrade_response(specs: dict) -> str:
    cpu = specs.get("cpu", "")
    gpu = specs.get("gpu", "")
    resolution = specs.get("resolution", "")

    cpu_name = cpu_display.get(cpu, cpu)
    gpu_name = gpu_display.get(gpu, gpu)
    res_name = resolution_display.get(resolution, resolution)

    suggestions = []
    if gpu == "gtx-1050":
        suggestions.append("• Upgrading to the GTX 1650 or RTX 3050 would give you a noticeable FPS boost.")
    elif gpu == "gtx-1650":
        suggestions.append("• Upgrading to the RTX 3050 or RTX 4060 would give you a solid FPS improvement.")
    elif gpu == "rtx-3050":
        suggestions.append("• Upgrading to the RTX 4060 Ti would give you ~30% more FPS.")
    elif gpu == "rtx-4060":
        suggestions.append("• Upgrading to the RTX 4070 would give you ~25% more FPS.")
    elif gpu == "rtx-4070":
        suggestions.append("• Upgrading to the RTX 4090 would give you ~30% more FPS for demanding titles.")
    else:
        suggestions.append("• Your GPU is already top-tier — no GPU upgrade needed!")

    if resolution == "3840x2160":
        suggestions.append("• Dropping to 1440p would significantly boost FPS without losing much visual quality.")
    elif resolution == "2560x1440":
        suggestions.append("• If FPS is your priority, 1080p still offers the highest frame rates.")
    else:
        suggestions.append("• 1080p is already great for high frame rates!")

    return (
        f"💡 Upgrade Recommendations for your setup:\n\n"
        f"Current: {cpu_name} | {gpu_name} | {res_name}\n\n"
        + "\n".join(suggestions)
    )

# Main response function
def get_response(user_input: str, specs: dict | None, conversation_state: dict | None) -> tuple:
    if conversation_state is None:
        conversation_state = {}

    fixed_input = fix_typos(user_input)
    processed_input = preprocess_text(fixed_input)
    current_state = conversation_state.get("state", None)
    updated_specs = specs.copy() if specs else {}

    # STATE: Waiting for user to pick a numbered option for CPU
    if current_state == "awaiting_cpu_pick":
        pick = detect_option_pick(fixed_input)
        if pick and pick in cpu_options:
            new_cpu = cpu_options[pick]
            updated_specs["cpu"] = new_cpu
            return (
                f"✅ CPU updated to {cpu_display[new_cpu]}!\n\n"
                f"Your new specs:\n"
                f"• CPU: {cpu_display.get(updated_specs.get('cpu',''), '')}\n"
                f"• GPU: {gpu_display.get(updated_specs.get('gpu',''), '')}\n"
                f"• Resolution: {resolution_display.get(updated_specs.get('resolution',''), '')}\n\n"
                f"Now ask me about any game to get your new FPS estimate!",
                updated_specs,
                {"state": None}
            )
        else:
            return ("Please reply with 1–4 to pick a CPU.", updated_specs, conversation_state)

    # STATE: Waiting for user to pick a numbered option for GPU
    if current_state == "awaiting_gpu_pick":
        pick = detect_option_pick(fixed_input)
        if pick and pick in gpu_options:
            new_gpu = gpu_options[pick]
            updated_specs["gpu"] = new_gpu
            return (
                f"✅ GPU updated to {gpu_display[new_gpu]}!\n\n"
                f"Your new specs:\n"
                f"• CPU: {cpu_display.get(updated_specs.get('cpu',''), '')}\n"
                f"• GPU: {gpu_display.get(updated_specs.get('gpu',''), '')}\n"
                f"• Resolution: {resolution_display.get(updated_specs.get('resolution',''), '')}\n\n"
                f"Now ask me about any game to get your new FPS estimate!",
                updated_specs,
                {"state": None}
            )
        else:
            return ("Please reply with 1–6 to pick a GPU.", updated_specs, conversation_state)

    # STATE: Waiting for user to pick a numbered option for Resolution
    if current_state == "awaiting_resolution_pick":
        pick = detect_option_pick(fixed_input)
        if pick and pick in resolution_options:
            new_res = resolution_options[pick]
            updated_specs["resolution"] = new_res
            return (
                f"✅ Resolution updated to {resolution_display[new_res]}!\n\n"
                f"Your new specs:\n"
                f"• CPU: {cpu_display.get(updated_specs.get('cpu',''), '')}\n"
                f"• GPU: {gpu_display.get(updated_specs.get('gpu',''), '')}\n"
                f"• Resolution: {resolution_display.get(updated_specs.get('resolution',''), '')}\n\n"
                f"Now ask me about any game to get your new FPS estimate!",
                updated_specs,
                {"state": None}
            )
        else:
            return ("Please reply with 1, 2, or 3 to pick a resolution.", updated_specs, conversation_state)

    # STATE: Waiting for user to say which spec category to change
    if current_state == "awaiting_spec_category":
        category = detect_spec_category(fixed_input)
        if category == "cpu":
            return (cpu_options_message(), updated_specs, {"state": "awaiting_cpu_pick"})
        elif category == "gpu":
            return (gpu_options_message(), updated_specs, {"state": "awaiting_gpu_pick"})
        elif category == "resolution":
            return (resolution_options_message(), updated_specs, {"state": "awaiting_resolution_pick"})
        else:
            return (
                "Please type CPU, GPU, or Resolution — which one would you like to change?",
                updated_specs,
                conversation_state
            )

    # NORMAL FLOW

    # Check if user wants to change specs
    if detect_change_request(fixed_input):
        category = detect_spec_category(fixed_input)
        if category == "cpu":
            return (cpu_options_message(), updated_specs, {"state": "awaiting_cpu_pick"})
        elif category == "gpu":
            return (gpu_options_message(), updated_specs, {"state": "awaiting_gpu_pick"})
        elif category == "resolution":
            return (resolution_options_message(), updated_specs, {"state": "awaiting_resolution_pick"})
        else:
            return (ask_which_spec_message(), updated_specs, {"state": "awaiting_spec_category"})

    # Check for a known game
    game = detect_game(fixed_input)
    if game and specs:
        return (build_fps_response(game, updated_specs), updated_specs, {"state": None})

    if not processed_input:
        return (unknown_input_response(), updated_specs, {"state": None})

    # ML intent prediction
    try:
        prediction = model.predict([processed_input])[0]
        confidence = max(model.predict_proba([processed_input])[0])
        tag = index_to_tag.get(prediction, "unknown")

        # If model is not confident enough, treat as unknown input
        if confidence < 0.25:
            return (unknown_input_response(), updated_specs, {"state": None})

    except Exception:
        return ("Sorry, I encountered an error. Please try again.", updated_specs, {"state": None})

    if specs:
        if tag in ("fps_query", "game_recommendations"):
            return (unknown_game_response(), updated_specs, {"state": None})

        if tag == "upgrade_question":
            return (build_upgrade_response(specs), updated_specs, {"state": None})

        if tag == "game_recommendations":
            cpu = specs.get("cpu", "")
            gpu = specs.get("gpu", "")
            resolution = specs.get("resolution", "")
            base_fps = fps_data.get(cpu, {}).get(gpu, {}).get(resolution, 0)

            if base_fps == 0:
                return ("Tell me a specific game and I'll check if you can run it!", updated_specs, {"state": None})

            playable = [g.title() for g, m in game_multipliers.items() if int(base_fps * m) >= 60]
            demanding = [g.title() for g, m in game_multipliers.items() if int(base_fps * m) < 60]

            resp = f"Based on your specs, here's what you can run at {resolution_display.get(resolution, resolution)}:\n\n"
            if playable:
                resp += f"✅ Runs well (60+ FPS): {', '.join(playable[:6])}\n"
            if demanding:
                resp += f"⚠️ May struggle (<60 FPS): {', '.join(demanding[:4])}\n"
            resp += "\nAsk me about a specific game for a detailed FPS estimate!"
            return (resp, updated_specs, {"state": None})

    # Fall back to standard intent responses
    for intent in intents:
        if intent["tag"] == tag:
            return (random.choice(intent["responses"]), updated_specs, {"state": None})

    return (unknown_input_response(), updated_specs, {"state": None})


# Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        specs = data.get('specs', None)
        conversation_state = data.get('conversation_state', {})

        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        response, updated_specs, updated_state = get_response(user_message, specs, conversation_state)

        return jsonify({
            'user_message': user_message,
            'bot_response': response,
            'updated_specs': updated_specs,
            'conversation_state': updated_state,
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