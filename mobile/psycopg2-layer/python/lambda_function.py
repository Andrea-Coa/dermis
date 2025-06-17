import json
import psycopg2
from typing import Dict, Any, Optional
import uuid
def lambda_handler(event, context):
    # Determinar el método HTTP
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    
    if http_method == 'POST':
        return handle_post_request(event)
    elif http_method == 'PATCH':
        return handle_patch_request(event)
    else:
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }

def handle_post_request(event) -> Dict[str, Any]:
    """Maneja la creación de nuevos usuarios"""
    data = json.loads(event['body'])
    user_id = str(uuid.uuid4())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO users (user_id, name, email, age, nick_name, skyn_type, skyn_conditions)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get('name'),
            data.get('email'),
            data.get('age'),
            data.get('nick_name'),
            None,  # skyn_type inicial
            json.dumps([])  # skyn_conditions inicial como array vacío
        ))

        conn.commit()
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'User registered successfully',
                'user_id': user_id,
                'skyn_type': None,
                'skyn_conditions': []
            })
        }

    except Exception as e:
        return handle_error(e)
    finally:
        if 'conn' in locals():
            conn.close()

def handle_patch_request(event) -> Dict[str, Any]:
    """Maneja la actualización de datos de piel del usuario"""
    data = json.loads(event['body'])
    user_id = data.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'user_id is required'})
        }

    updates = {}
    if 'skyn_type' in data:
        updates['skyn_type'] = data['skyn_type']
    if 'skyn_conditions' in data:
        updates['skyn_conditions'] = json.dumps(data['skyn_conditions'])

    if not updates:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No valid fields to update'})
        }

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        set_clause = ", ".join([f"{k} = %s" for k in updates.keys()])
        query = f"""
            UPDATE users
            SET {set_clause}
            WHERE user_id = %s
            RETURNING user_id, skyn_type, skyn_conditions
        """
        
        cursor.execute(query, list(updates.values()) + [user_id])
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }

        conn.commit()
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Skin data updated successfully',
                'user_id': result[0],
                'skyn_type': result[1],
                'skyn_conditions': json.loads(result[2]) if result[2] else []
            })
        }

    except Exception as e:
        return handle_error(e)
    finally:
        if 'conn' in locals():
            conn.close()

def get_db_connection():
    """Obtiene conexión a la base de datos"""
    return psycopg2.connect(
        host='3.82.196.32',
        dbname='dermis_users',
        user='dermis_user',
        password='jacdermisapp',
        port=5432
    )

def handle_error(error: Exception) -> Dict[str, Any]:
    """Maneja errores y devuelve respuesta adecuada"""
    error_msg = str(error)
    print(f"Database error: {error_msg}")
    
    return {
        'statusCode': 500,
        'body': json.dumps({
            'error': 'Database operation failed',
            'details': error_msg
        })
    }