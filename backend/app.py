import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# pyrefly: ignore [missing-import]
from backend.config import Config
# pyrefly: ignore [missing-import]
from backend.database import init_db, seed_sample_data
# pyrefly: ignore [missing-import]
from backend.routes.auth_routes import auth_bp
# pyrefly: ignore [missing-import]
from backend.routes.predict_routes import predict_bp
# pyrefly: ignore [missing-import]
from backend.routes.history_routes import history_bp
# pyrefly: ignore [missing-import]
from backend.routes.chat_routes import chat_bp
# pyrefly: ignore [missing-import]
from backend.routes.alert_routes import alert_bp
# pyrefly: ignore [missing-import]
from backend.routes.report_routes import report_bp
# pyrefly: ignore [missing-import]
from backend.routes.forecast_routes import forecast_bp
# pyrefly: ignore [missing-import]
from backend.routes.analytics_routes import analytics_bp


frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
root_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))
dist_folder = frontend_dist if os.path.exists(frontend_dist) else root_dist



def create_app():
    if os.path.exists(dist_folder):
        app = Flask(__name__, static_folder=dist_folder, static_url_path='')
    else:
        app = Flask(__name__)

    app.config.from_object(Config)
    
    # Enable CORS for all routes (Vite frontend on 5173 / production build)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Database
    init_db()
    seed_sample_data()
    
    # Check if ML model binary exists; if not, generate dataset & train model
    model_path = Config.MODEL_PATH
    if not os.path.exists(model_path):
        print("ML model binary missing on startup. Triggering initial dataset generation & Random Forest training...")
        try:
            # pyrefly: ignore [missing-import]
            from backend.train_model import train_and_save_model
            train_and_save_model()
        except Exception as e:
            print(f"Error during auto model training: {e}")

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(analytics_bp)


    @app.route('/api/health')
    def health():
        return jsonify({'status': 'HEALTHY', 'database': 'CONNECTED'})

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        if path.startswith('api/'):
            return jsonify({'error': 'Endpoint Not Found', 'path': path}), 404
        if os.path.exists(dist_folder):
            file_path = os.path.join(dist_folder, path)
            if path != "" and os.path.exists(file_path):
                return send_from_directory(dist_folder, path)
            return send_from_directory(dist_folder, 'index.html')
        return jsonify({
            'system': 'HydroFusion AI - The Digital Chemist',
            'version': '2.0.0-PRO',
            'status': 'OPERATIONAL'
        })

    return app


app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting HydroFusion AI Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
