# app.py
# Flask web app: upload markdown -> parse -> ask preference -> scrape/filter -> results JSON

import os
from flask import Flask, request, render_template, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from crew import Crew
from pathlib import Path

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'md', 'markdown', 'txt'}

load_dotenv()  # loads .env
CEREBRAS_API_KEY = os.getenv('CEREBRAS_API_KEY')
SERPER_API_KEY = os.getenv('SERPER_API_KEY')
DEFAULT_LOCALITY = os.getenv('DEFAULT_LOCALITY', '')

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

crew = Crew(env=os.environ.copy())

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html', default_locality=DEFAULT_LOCALITY)

@app.route('/upload', methods=['POST'])
def upload_markdown():
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        path = Path(app.config['UPLOAD_FOLDER']) / filename
        file.save(path)
        md_text = path.read_text(encoding='utf-8')
        # parse incomes and expenses via crew
        res = crew.run_task('parse_markdown', {'markdown': md_text})
        return jsonify(res)
    return jsonify({'error': 'invalid file type'}), 400

@app.route('/set_pref', methods=['POST'])
def set_pref():
    """
    Expects JSON:
    {
      "preference": {"own_area": true, "locality": "Mumbai", "budget": 12000000}
    }
    """
    data = request.json or {}
    pref = data.get('preference') or {}
    # Store ephemeral pref in session? For simplicity return ack
    return jsonify({'status': 'ok', 'preference': pref})

@app.route('/search_listings', methods=['POST'])
def search_listings():
    """
    Expects:
    {
      "locality": "Bandra, Mumbai",
      "budget": 12000000,
      "max_results": 20,
      "allow_other": true
    }
    """
    payload = request.json or {}
    locality = payload.get('locality') or DEFAULT_LOCALITY
    budget = payload.get('budget')
    max_results = payload.get('max_results', 20)
    # run scraper via crew
    scrape_res = crew.run_task('scrape_listings', {'locality': locality, 'budget': budget, 'max_results': max_results})
    listings = scrape_res.get('listings', [])
    filter_res = crew.run_task('filter_listings', {'listings': listings, 'budget': budget, 'locality': locality, 'allow_other': payload.get('allow_other', True)})
    return jsonify(filter_res)

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
