from urllib import request
from chalice import Chalice
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import extraction_service
from chalicelib import contact_store

import base64
import json

# chalice app configuration
app = Chalice(app_name='Capabilities')
app.debug = True

# services initialization
storage_location = 'content301155132'
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_location)
extraction_service = extraction_service.ExtractionService()
store_location = 'Contacts'
contact_store = contact_store.ContactStore(store_location)

@app.route('/images/{image_id}/extract-info', methods = ['POST'], cors = True)
def extract_image_info(image_id):
    MIN_CONFIDENCE = 70

    text_lines = recognition_service.detect_text(image_id)

    print(text_lines)

    contact_lines = []
    for line in text_lines:
        # check confidence
        if float(line['confidence']) >= MIN_CONFIDENCE:
            contact_lines.append(line['text'])
    
    contact_string = '   '.join(contact_lines)
    contact_info = extraction_service.extract_contact_info(contact_string)

    print(contact_info)

    return contact_info

@app.route('/contacts', methods = ['POST'], cors = True)
def save_contact():
    request_data = json.loads(app.current_request.raw_body)

    contact = contact_store.save_contact(request_data)

    return contact

@app.route('/contacts', methods = ['GET'], cors = True)
def get_all_contacts():
    contacts = contact_store.get_all_contacts()

    return contacts

@app.route('/images', methods = ['POST'], cors = True)
def upload_image():
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data['filename']
    file_bytes = base64.b64decode(request_data['filebytes'])

    image_info = storage_service.upload_file(file_bytes, file_name)

    return image_info
