from flask import Blueprint, request, jsonify
import datetime

n8n_bp = Blueprint('n8n', __name__, url_prefix='/api/n8n')

@n8n_bp.route('/webhook', methods=['POST'])
def handle_n8n_webhook():
    """
    Webhook receiver endpoint that simulates an n8n workflow node receiving an alert event.
    """
    data = request.get_json() or {}
    event_name = data.get('event', 'GENERAL_WEBHOOK_EVENT')
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"[n8n Receiver Simulation] Received event '{event_name}' at {timestamp}")
    
    return jsonify({
        'n8n_status': 'RECEIVED',
        'event': event_name,
        'processed_at': timestamp,
        'message': 'n8n workflow executed successfully. Dispatched multi-agent notification payload.'
    }), 200
