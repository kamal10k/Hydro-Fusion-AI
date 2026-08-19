import os
from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import Config
from backend.database import init_db, seed_sample_data
from backend.routes.auth_routes import auth_bp
from backend.routes.predict_routes import predict_bp
from backend.routes.history_routes import history_bp
from backend.routes.chat_routes import chat_bp
from backend.routes.alert_routes import alert_bp
from backend.routes.report_routes import report_bp
from backend.routes.n8n_routes import n8n_bp
from backend.routes.forecast_routes import forecast_bp
from backend.routes.analytics_routes import analytics_bp

def create_app():
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
    app.register_blueprint(n8n_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(analytics_bp)

    @app.route('/')
    def root():
        return jsonify({
            'system': 'HydroFusion AI - The Digital Chemist',
            'version': '2.0.0-PRO',
            'status': 'OPERATIONAL',
            'endpoints': [
                '/api/auth/login',
                '/api/predict',
                '/api/simulate',
                '/api/forecast/24h',
                '/api/analytics/daily',
                '/api/analytics/weekly',
                '/api/analytics/monthly',
                '/api/history',
                '/api/dashboard/stats',
                '/api/chat',
                '/api/alerts',
                '/api/alerts/thresholds',
                '/api/report/export'
            ]
        })

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'HEALTHY', 'database': 'CONNECTED'})

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting HydroFusion AI Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
