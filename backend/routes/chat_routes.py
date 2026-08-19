from flask import Blueprint, request, jsonify
from backend.database import get_db_connection
from backend.services.gemini_service import gemini_service

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

@chat_bp.route('/chat', methods=['POST'])
def send_chat_message():
    data = request.get_json() or {}
    question = data.get('question', '').strip()
    user_id = data.get('user_id', 1)
    
    if not question:
        return jsonify({'error': 'Question cannot be empty.'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest prediction for contextual awareness
    cursor.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1")
    latest_row = cursor.fetchone()
    context_data = {'latest_prediction': dict(latest_row)} if latest_row else {}
    
    # Generate Gemini response
    bot_response = gemini_service.generate_chatbot_response(question, context_data=context_data)
    
    # Save chat entry
    cursor.execute('''
        INSERT INTO chat_history (user_id, question, response)
        VALUES (?, ?, ?)
    ''', (user_id, question, bot_response))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'question': question,
        'response': bot_response,
        'context_used': bool(context_data)
    }), 200

@chat_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 30")
    rows = cursor.fetchall()
    history = [dict(row) for row in rows]
    conn.close()
    
    return jsonify({
        'count': len(history),
        'chat_history': history
    }), 200
