import base64
import json


# def encode_flags():

with open('countries.json') as json_file:
    data = json.load(json_file)

    for d in data:
        try:
            with open('flags/' + d.lower() + '.png', 'rb') as image_file:
                encoded_string = base64.b64encode(image_file.read())
            print(data[d])
            data[d] = {'name': data[d], 'flag': str(encoded_string)[2:-1]}
        except Exception:
            pass

with open('countries.json', 'w') as outfile:
    json.dump(data, outfile)
