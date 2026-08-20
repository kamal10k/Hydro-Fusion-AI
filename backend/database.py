import sqlite3
import datetime
from backend.config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # USERS table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'Operator',
            facility_name TEXT DEFAULT 'Facility Alpha',
            is_verified INTEGER DEFAULT 0,
            verification_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Ensure schema migrations on existing users table
    cursor.execute("PRAGMA table_info(users)")
    user_cols = [col['name'] for col in cursor.fetchall()]
    if 'facility_name' not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN facility_name TEXT DEFAULT 'Facility Alpha'")
    if 'is_verified' not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
    if 'verification_token' not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")

    # Drop password_resets table if exists from recent OTP changes
    cursor.execute("DROP TABLE IF EXISTS password_resets")

    # PREDICTIONS table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_name TEXT,
            user_email TEXT,
            user_role TEXT,
            facility_name TEXT DEFAULT 'Facility Alpha',
            gpu_temperature REAL NOT NULL,
            gpu_power_load REAL NOT NULL,
            ambient_temperature REAL NOT NULL,
            humidity REAL NOT NULL,
            water_temperature REAL NOT NULL,
            tds REAL NOT NULL,
            ph REAL NOT NULL,
            conductivity REAL NOT NULL,
            tower_age REAL NOT NULL,
            cooling_cycles REAL NOT NULL,
            flow_rate REAL NOT NULL,
            daily_water_usage REAL NOT NULL,
            scaling_prediction TEXT NOT NULL,
            risk_probability REAL NOT NULL,
            freshwater_ratio REAL NOT NULL,
            greywater_ratio REAL NOT NULL,
            cost_savings_inr REAL DEFAULT 0.0,
            confidence_score REAL DEFAULT 95.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')

    # Ensure schema migrations on existing predictions table
    cursor.execute("PRAGMA table_info(predictions)")
    columns = [col['name'] for col in cursor.fetchall()]
    if 'cost_savings_inr' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN cost_savings_inr REAL DEFAULT 0.0")
    if 'confidence_score' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN confidence_score REAL DEFAULT 95.0")
    if 'user_name' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN user_name TEXT")
    if 'user_email' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN user_email TEXT")
    if 'user_role' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN user_role TEXT")
    if 'facility_name' not in columns:
        cursor.execute("ALTER TABLE predictions ADD COLUMN facility_name TEXT DEFAULT 'Facility Alpha'")


    # SYSTEM_THRESHOLDS table for configurable alert limits
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_thresholds (
            threshold_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tds_max_limit REAL DEFAULT 800.0,
            ph_min_limit REAL DEFAULT 6.8,
            ph_max_limit REAL DEFAULT 8.2,
            conductivity_max_limit REAL DEFAULT 1000.0,
            risk_probability_threshold REAL DEFAULT 60.0,
            rapid_increase_rate_threshold REAL DEFAULT 20.0,
            email_alerts_enabled INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # FORECAST_LOGS table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS forecast_logs (
            forecast_id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id INTEGER,
            time_horizon TEXT NOT NULL,
            forecasted_risk TEXT NOT NULL,
            forecasted_probability REAL NOT NULL,
            driving_factor TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prediction_id) REFERENCES predictions (prediction_id)
        )
    ''')

    # CHAT_HISTORY table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question TEXT NOT NULL,
            response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')

    # ALERTS table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id INTEGER,
            alert_type TEXT NOT NULL,
            severity TEXT DEFAULT 'HIGH',
            message TEXT NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prediction_id) REFERENCES predictions (prediction_id)
        )
    ''')

    # Ensure schema migration on existing alerts table
    cursor.execute("PRAGMA table_info(alerts)")
    alert_cols = [col['name'] for col in cursor.fetchall()]
    if 'severity' not in alert_cols:
        cursor.execute("ALTER TABLE alerts ADD COLUMN severity TEXT DEFAULT 'HIGH'")

    # Initialize default thresholds if not exists
    cursor.execute("SELECT COUNT(*) as count FROM system_thresholds")
    if cursor.fetchone()['count'] == 0:
        cursor.execute('''
            INSERT INTO system_thresholds (
                tds_max_limit, ph_min_limit, ph_max_limit, conductivity_max_limit,
                risk_probability_threshold, rapid_increase_rate_threshold, email_alerts_enabled
            ) VALUES (800.0, 6.8, 8.2, 1000.0, 60.0, 20.0, 1)
        ''')

    conn.commit()
    conn.close()

def seed_sample_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Ensure configured ADMIN_EMAIL exists as verified Admin user
    admin_email = Config.ADMIN_EMAIL.lower()
    cursor.execute("SELECT user_id FROM users WHERE email = ?", (admin_email,))
    admin_user = cursor.fetchone()
    if not admin_user:
        # Default password for admin seed account: admin123
        admin_pass_hash = '$2b$12$scw0C39GZO1hO/jpStMNUOLIY2ZbbOiUxMHRunVJHuwfn5hcz9iSG'
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, role, facility_name, is_verified)
            VALUES (?, ?, ?, ?, ?, 1)
        ''', ('Kamalaksha Admin', admin_email, admin_pass_hash, Config.ADMIN_ROLE, 'Global Operations Center'))


    # Mark existing demo users as verified so demo logins work
    cursor.execute("UPDATE users SET is_verified = 1 WHERE is_verified IS NULL OR is_verified = 0")
    
    cursor.execute("SELECT COUNT(*) as count FROM predictions")
    count = cursor.fetchone()['count']
    
    if count == 0:
        now = datetime.datetime.now()
        cursor.execute('''
            INSERT OR IGNORE INTO users (user_id, name, email, password_hash, role, facility_name, is_verified)
            VALUES (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', '$2b$12$scw0C39GZO1hO/jpStMNUOLIY2ZbbOiUxMHRunVJHuwfn5hcz9iSG', 'Admin', 'Facility Alpha', 1)
        ''')
        
        sample_predictions = [
            (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', 'Admin', 'Facility Alpha', 85.0, 92.0, 37.0, 70.0, 31.0, 750.0, 8.1, 950.0, 5.0, 15.0, 100.0, 5200.0, 'HIGH', 87.5, 80.0, 20.0, 124.8, 96.5, (now - datetime.timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')),
            (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', 'Admin', 'Facility Alpha', 72.0, 65.0, 28.0, 55.0, 24.0, 420.0, 7.2, 580.0, 2.0, 6.0, 120.0, 4100.0, 'LOW', 18.2, 40.0, 60.0, 295.2, 94.0, (now - datetime.timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S')),
            (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', 'Admin', 'Facility Alpha', 89.0, 96.0, 39.0, 75.0, 34.0, 880.0, 8.4, 1150.0, 7.0, 18.0, 95.0, 5800.0, 'CRITICAL', 94.1, 90.0, 10.0, 69.6, 98.2, (now - datetime.timedelta(hours=14)).strftime('%Y-%m-%d %H:%M:%S')),
            (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', 'Admin', 'Facility Alpha', 68.0, 50.0, 22.0, 45.0, 21.0, 350.0, 7.0, 480.0, 1.0, 4.0, 130.0, 3800.0, 'LOW', 11.4, 30.0, 70.0, 319.2, 93.5, (now - datetime.timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')),
            (1, 'Dr. Alex Vance', 'alex.vance@hydrofusion.ai', 'Admin', 'Facility Alpha', 81.0, 85.0, 33.0, 62.0, 29.0, 610.0, 7.8, 810.0, 4.0, 11.0, 105.0, 4700.0, 'MEDIUM', 52.8, 60.0, 40.0, 225.6, 91.0, (now - datetime.timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'))
        ]
        
        cursor.executemany('''
            INSERT INTO predictions (
                user_id, user_name, user_email, user_role, facility_name,
                gpu_temperature, gpu_power_load, ambient_temperature, humidity, water_temperature,
                tds, ph, conductivity, tower_age, cooling_cycles, flow_rate, daily_water_usage,
                scaling_prediction, risk_probability, freshwater_ratio, greywater_ratio, cost_savings_inr, confidence_score, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_predictions)
        
        sample_alerts = [
            (1, 'CRITICAL_SCALING', 'CRITICAL', 'High Mineral Scaling Risk (87.5%) detected. GPU thermal stress at 85°C with elevated TDS (750 ppm).', 'Active', (now - datetime.timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')),
            (3, 'EXTREME_SCALING', 'CRITICAL', 'Extreme Scaling Warning (94.1%). High cooling cycles (18) and alkaline pH (8.4). Immediate ratio shift to 90% Freshwater recommended.', 'Active', (now - datetime.timedelta(hours=14)).strftime('%Y-%m-%d %H:%M:%S'))
        ]
        cursor.executemany('''
            INSERT INTO alerts (prediction_id, alert_type, severity, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_alerts)
        
        sample_chats = [
            (1, 'Why is my scaling risk high?', 'The current scaling risk is HIGH (87.5%) primarily due to high TDS (750 ppm), elevated pH (8.1), and high GPU power load (92%) resulting in elevated cooling water temperature (31°C). At 15 cooling cycles, mineral supersaturation occurs rapidly.', (now - datetime.timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S'))
        ]
        cursor.executemany('''
            INSERT INTO chat_history (user_id, question, response, created_at)
            VALUES (?, ?, ?, ?)
        ''', sample_chats)

    # Backfill predictions metadata for historical compatibility
    cursor.execute('''
        UPDATE predictions 
        SET user_name = (SELECT name FROM users WHERE users.user_id = predictions.user_id),
            user_email = (SELECT email FROM users WHERE users.user_id = predictions.user_id),
            user_role = (SELECT role FROM users WHERE users.user_id = predictions.user_id),
            facility_name = COALESCE((SELECT facility_name FROM users WHERE users.user_id = predictions.user_id), 'Facility Alpha')
        WHERE user_name IS NULL OR user_email IS NULL
    ''')

    conn.commit()
    conn.close()

