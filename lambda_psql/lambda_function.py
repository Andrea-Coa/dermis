import json
import uuid
import psycopg2

def lambda_handler(event, context):
    if 'requestContext' in event and 'http' in event['requestContext']:
        http_method = event['requestContext']['http']['method']
    else:
        # Si no es una solicitud HTTP, asumimos POST (o manejas error)
        http_method = 'POST' 

    if http_method == 'POST':
            print("entro en post")
            data = json.loads(event['body'])
            user_id = str(uuid.uuid4())

            try:
                conn = psycopg2.connect(
                    host='54.157.223.192',
                    dbname='dermis_users',
                    user='dermis_user',
                    password='jacdermisapp',
                    port=5432
                )
                print("se conectó a la bd")
                cursor = conn.cursor()

                cursor.execute("""
                    INSERT INTO users (user_id, name, email, age,nick_name, skyn_type, skyn_conditions)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id,
                    data.get('name'),
                    data.get('email'),
                    data.get('age'),
                    data.get('nick_name'),
                    None,
                    json.dumps([])
                ))

                conn.commit()
                cursor.close()
                conn.close()

                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'User registered', 'user_id': user_id})
                }

            except Exception as e:
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': str(e)})
                }

    elif http_method =='PATH':

        data = json.loads(event['body'])
        #user_id = event['pathParameters']['user_id']
        user_id =data['_user_id']
        skin_type = data['results']['cnn']['skinType']
        conditions = data['results']['eff']['conditions']
        try:
            conn = psycopg2.connect(
                host='54.157.223.192',
                dbname='dermis_users',
                user='dermis_user',
                password='jacdermisapp',
                port=5432
            )
            cursor = conn.cursor()

            cursor.execute("""
                UPDATE users 
                SET skyn_type = %s, 
                    skyn_conditions = %s
                WHERE user_id = %s
            """, (
                skin_type,
                json.dumps(conditions),
                user_id
            ))

            conn.commit()
            cursor.close()
            conn.close()

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'User updated successfully'})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }
    
    else:
         return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }
         
