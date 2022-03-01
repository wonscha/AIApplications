from urllib import request
from chalice import Chalice
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import translation_service

import base64
import json

# chalice app configuration
app = Chalice(app_name='Capabilities')
app.debug = True

# services initialization
storage_location = 'content301155132'
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_service)
translation_service = translation_service.TranslationService()

# RESTful endpoints
@app.route('/images/{image_id}/translate-text', methods=['POST'], cors=True)
def translate_image_text(image_id):
    """detects then translates text in the specified image"""
    request_data = json.loads(app.current_request.raw_body)
    from_lang = request_data['fromLang']
    to_lang = request_data['toLang']

    MIN_CONFIDENCE = 80.0

    print(request_data, from_lang, to_lang)

    text_lines = recognition_service.detect_text(image_id)

    translated_lines = []
    for line in text_lines:
        if float(line['confidence']) >= MIN_CONFIDENCE:
            translated_line = translation_service.translate_text(line['text'], from_lang, to_lang)
            translated_lines.append({
                'text': line['text'],
                'translation': translated_line,
                'boundingBox': line['boundingBox']
            })

    return translated_lines

@app.route('/images', methods=['POST'], cors=True)
def upload_image():
    """Processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data['filename']
    file_bytes = base64.b64decode(request_data['filebytes'])

    image_info = storage_service.upload_file(file_bytes, file_name)

    return image_info
